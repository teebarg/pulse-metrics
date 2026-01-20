import { type Context, type Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { organizations, users } from "../db/schema.js";
import { auth } from "../lib/auth.js";

export async function apiKeyMiddleware(c: Context, next: Next) {
    const apiKey = c.req.header("X-API-Key");

    if (!apiKey) {
        throw new HTTPException(401, { message: "API key required" });
    }

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
        throw new HTTPException(401, { message: "Invalid API key" });
    }

    if (typeof org.eventsLimit === "number" && (org.eventsUsed ?? 0) >= org.eventsLimit) {
        throw new HTTPException(429, {
            message: `Your ${org.plan} plan limit of ${org.eventsLimit} events has been reached.`,
        });
    }

    c.set("organizationId", org.id);
    c.set("organization", org);

    return next();
}

export async function verifyApiKey(c: Context, next: Next) {
    try {
        const token = extractToken(c);
        console.log("🚀 ~ file: auth.ts:45 ~ token:", token);
        console.log("🚀 ~ file: auth.ts:46 ~ header:", c.req.raw.headers);
        if (!token) {
            return c.json({ error: "Authorization token required" }, 401);
        }

        const session = await auth.api.getSession({
            headers: c.req.raw.headers,
        });

        if (!session) {
            return c.json({ error: "Invalid or expired token" }, 401);
        }

        const [org] = await db
            .select({
                id: organizations.id,
                plan: organizations.plan,
                eventsLimit: organizations.eventsLimit,
                eventsUsed: organizations.eventsUsed,
            })
            .from(users)
            .where(eq(users.id, session.user.id))
            .innerJoin(organizations, eq(organizations.id, users.organizationId))
            .limit(1);

        if (!org) {
            return c.json({ error: "Invalid Organization" }, 401);
        }

        c.set("organizationId", org.id);
        c.set("organization", org);
        c.set("user", {
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user,
        });

        await next();
    } catch (err) {
        console.error("API key verification error:", err);
        return c.json({ error: "Authentication failed in verifyApiKey" }, 400);
    }
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
 * Verifies JWT token and adds user info to context
 *
 * Usage:
 * app.use("/v1/*", authMiddleware);
 */
export async function authMiddleware(c: Context, next: Next) {
    try {
        const token = extractToken(c);
        if (!token) {
            return c.json({ error: "Authorization token required" }, 401);
        }

        const session = await auth.api.getSession({
            headers: c.req.raw.headers,
        });

        if (!session) {
            return c.json({ error: "Invalid or expired token" }, 401);
        }

        c.set("user", {
            id: session.user.id,
            email: session.user.email,
            user_metadata: session.user,
        });

        await next();
    } catch (error) {
        if (error instanceof HTTPException) {
            throw error;
        }

        console.error("Auth middleware error:", error);
        return c.json({ error: "Authentication failed" }, 401);
    }
}

/**
 * Optional authentication middleware
 * Adds user to context if token is present, but doesn't require it
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
    try {
        const token = extractToken(c);
        const session = await auth.api.getSession({
            headers: c.req.raw.headers,
        });

        if (token) {
            if (session) {
                c.set("user", {
                    id: session.user.id,
                    email: session.user.email,
                    user_metadata: session.user,
                });
            }
        }
    } catch (error) {
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
