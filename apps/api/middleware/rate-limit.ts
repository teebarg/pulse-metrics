import { type Context, type Next } from "hono";
import Redis from "ioredis";

const redis = new Redis.default(process.env.REDIS_URL!);

export async function checkRateLimit(c: Context, next: Next) {
    const organizationId = c.get("organizationId");
    const org = c.get("organization");

    if (!organizationId || !org) {
        return c.json({ error: "Organization not found" }, 400);
    }

    const rateLimits = {
        free: 60,
        pro: 600,
        enterprise: 6000,
    };
    const limit = rateLimits[org.plan as keyof typeof rateLimits] || 60;

    try {
        const key = `ratelimit:${organizationId}`;
        const now = Date.now();
        const windowSize = 60 * 1000; // 1 minute in ms
        const windowStart = now - windowSize;

        // Remove outdated timestamps
        await redis.zremrangebyscore(key, 0, windowStart);

        // Get current count in window
        const currentCount = await redis.zcard(key);

        if (currentCount >= limit) {
            return c.json(
                {
                    error: "Rate limit exceeded",
                    message: `Plan limit: ${limit} requests per minute`,
                },
                429
            );
        }

        // Add current timestamp to sorted set
        await redis.zadd(key, now, `${now}`);

        // Expire key slightly after window to free memory
        await redis.expire(key, 65); // 65 seconds

        await next();
    } catch (err) {
        console.error("Rate limit error:", err);
        await next();
    }
}
