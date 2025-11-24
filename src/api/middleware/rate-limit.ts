import { Context, Next } from 'hono';
import { Redis } from '@upstash/redis/cloudflare';

export async function checkRateLimit(c: Context, next: Next) {
    const organizationId = c.get('organizationId');
    const org = c.get('organization');

    // Rate limits per plan (requests per minute)
    const rateLimits = {
        free: 60,
        pro: 600,
        enterprise: 6000,
    };

    const limit = rateLimits[org.plan as keyof typeof rateLimits] || 60;

    try {
        const redis = Redis.fromEnv(c.env);
        const key = `ratelimit:${organizationId}:${Math.floor(Date.now() / 60000)}`;

        const requests = await redis.incr(key);
        await redis.expire(key, 60); // Expire after 1 minute

        if (requests > limit) {
            return c.json({
                error: 'Rate limit exceeded',
                message: `Plan limit: ${limit} requests per minute`
            }, 429);
        }

        await next();
    } catch (error) {
        console.error('Rate limit error:', error);
        // Don't block request if Redis fails
        await next();
    }
}