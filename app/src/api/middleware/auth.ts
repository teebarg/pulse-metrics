import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/api/db";
import { organizations, users } from "@/api/db/schema";
import { generateApiKey } from "../utils/common.utils";
import { eq } from "drizzle-orm";

export async function verifyApiKey(c: Context, next: Next) {
    const apiKey = c.req.header("X-API-Key");

    if (!apiKey) {
        return c.json({ error: "API key required" }, 401);
    }

    try {
        const [org] = await db
            .select({
                id: organizations.id,
                plan: organizations.plan,
                eventsLimit: organizations.eventsLimit,
                eventsUsed: organizations.eventsUsed,
            })
            .from(organizations)
            .where(eq(organizations.apiKey, apiKey))
            .limit(1);

        if (!org) {
            return c.json({ error: "Invalid API key" }, 401);
        }

        if (org.eventsUsed >= org.eventsLimit) {
            return c.json(
                {
                    error: "Event limit exceeded",
                    message: `Your ${org.plan} plan limit of ${org.eventsLimit} events has been reached.`,
                },
                429
            );
        }

        c.set("organizationId", org.id);
        c.set("organization", org);

        await next();
    } catch (err) {
        console.error("API key verification error:", err);
        return c.json({ error: "Authentication failed" }, 500);
    }
}

/**
 * Supabase client for JWT verification
 */
function getSupabaseForAuth() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set for authentication");
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

/**
 * Extract JWT token from Authorization header
 */
function extractToken(c: Context): string | null {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) return null;

    // Support both "Bearer <token>" and just "<token>"
    if (authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }
    return authHeader;
}

/**
 * Authentication middleware for Hono
 * Verifies Supabase JWT token and adds user info to context
 *
 * Usage:
 * app.use("/v1/*", authMiddleware);
 */
export async function authMiddleware(c: Context, next: Next) {
    try {
        const token = extractToken(c);

        if (!token) {
            throw new HTTPException(401, {
                message: "Authorization token required",
            });
        }

        const supabase = getSupabaseForAuth();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new HTTPException(401, {
                message: "Invalid or expired token",
            });
        }

        const dbUser = await db.select().from(users).where(eq(users.id, user.id));
        if (!dbUser[0]) {
            const name = user.user_metadata?.name || user.email?.split("@")[0] || "User";
            await db.insert(users).values({
                id: user.id,
                firstName: name,
                lastName: name,
                email: user.email,
            });
        }

        c.set("user", {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
        });

        await next();
    } catch (error) {
        if (error instanceof HTTPException) {
            throw error;
        }

        console.error("Auth middleware error:", error);
        throw new HTTPException(401, {
            message: "Authentication failed",
        });
    }
}

/**
 * Optional authentication middleware
 * Adds user to context if token is present, but doesn't require it
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
    try {
        const token = extractToken(c);

        if (token) {
            const supabase = getSupabaseForAuth();
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser(token);

            if (!error && user) {
                c.set("user", {
                    id: user.id,
                    email: user.email,
                    user_metadata: user.user_metadata,
                });
            }
        }
    } catch (error) {
        // Silently fail for optional auth
        console.warn("Optional auth failed:", error);
    }

    await next();
}

/**
 * Get authenticated user from context
 * Throws if user is not authenticated
 */
export function getAuthenticatedUser(c: Context) {
    const user = c.get("user");
    if (!user) {
        throw new HTTPException(401, {
            message: "User not authenticated",
        });
    }
    return user;
}

/**
 * Type definition for authenticated context
 */
export type AuthenticatedContext = Context & {
    get: (key: "user") => {
        id: string;
        email?: string;
        user_metadata?: Record<string, any>;
    };
};
