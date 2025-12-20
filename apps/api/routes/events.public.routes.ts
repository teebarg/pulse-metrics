import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema, SuccessSchema } from "~/schemas/common.schemas.js";
import { BatchEventSchema, EventSchema } from "../schemas/event.schemas";
import { errorResponse, successResponse } from "../utils/response.utils";
import { events, organizations } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { db } from "~/db";
import { apiKeyMiddleware } from "~/middleware/auth";

export const eventsPublicRoute = new OpenAPIHono();

// eventsPublicRoute.use(apiKeyMiddleware);

eventsPublicRoute.openapi(
    createRoute({
        method: "post",
        path: "/",
        security: [{ ApiKeyAuth: [] }],
        tags: ["events"],
        description: "Create an event",
        request: {
            body: {
                content: { "application/json": { schema: EventSchema } },
            },
        },
        responses: {
            200: {
                description: "Event tracked",
                content: {
                    "application/json": { schema: SuccessSchema },
                },
            },
            401: {
                description: "Unauthorized",
                content: {
                    "application/json": {
                        schema: z.object({ error: z.string() }),
                    },
                },
            },
            429: {
                description: "Plan limit exceeded",
                content: {
                    "application/json": {
                        schema: z.object({
                            error: z.string(),
                            message: z.string(),
                        }),
                    },
                },
            },
            500: {
                description: "Server error",
                content: {
                    "application/json": { schema: ErrorSchema },
                },
            },
        },
    }),
    async (c) => {
        const event = c.req.valid("json");
        const org = c.get("organization") as unknown as any;

        if (typeof org.eventsLimit === "number" && (org.eventsUsed ?? 0) >= org.eventsLimit) {
            return c.json(
                {
                    error: "Event limit exceeded",
                    message: `Your ${org.plan} plan limit of ${org.eventsLimit} events has been reached.`,
                },
                429
            );
        }

        try {
            await db.insert(events).values({
                organizationId: org.id,
                eventType: event.event_type,
                sessionId: event.session_id,
                metadata: event.metadata,
                timestamp: new Date(),
            });

            await db
                .update(organizations)
                .set({
                    eventsUsed: sql`${organizations.eventsUsed} + 1`,
                })
                .where(eq(organizations.id, org.id));

            return successResponse(c, {
                success: true,
                message: "Event tracked",
            });
        } catch (error: any) {
            console.error("Event ingestion error:", error);
            return errorResponse(c, "Failed to process chat", error.message);
        }
    },
    apiKeyMiddleware
);

eventsPublicRoute.openapi(
    createRoute({
        method: "post",
        path: "/batch",
        security: [{ ApiKeyAuth: [] }],
        tags: ["events"],
        description: "Create an batch events",
        request: {
            body: {
                content: { "application/json": { schema: BatchEventSchema } },
            },
        },
        responses: {
            200: {
                description: "Event tracked",
                content: {
                    "application/json": { schema: SuccessSchema },
                },
            },
            401: {
                description: "Unauthorized",
                content: {
                    "application/json": {
                        schema: z.object({ error: z.string() }),
                    },
                },
            },
            429: {
                description: "Plan limit exceeded",
                content: {
                    "application/json": {
                        schema: z.object({
                            error: z.string(),
                            message: z.string(),
                        }),
                    },
                },
            },
            500: {
                description: "Server error",
                content: {
                    "application/json": { schema: ErrorSchema },
                },
            },
        },
    }),
    async (c) => {
        const { events: eventData } = c.req.valid("json");
        const organizationId = c.get("organizationId");

        try {
            const eventRecords = eventData.map((event) => ({
                organizationId: organizationId,
                eventType: event.event_type,
                sessionId: event.session_id,
                metadata: event.metadata,
                timestamp: new Date(),
            }));

            await db.insert(events).values(eventRecords);

            await db
                .update(organizations)
                .set({
                    eventsUsed: sql`${organizations.eventsUsed} + ${eventRecords.length}`,
                })
                .where(eq(organizations.id, organizationId));

            return c.json({ success: true, message: `${eventRecords.length} events tracked` }, 201);
        } catch (error) {
            console.error("Batch ingestion error:", error);
            return c.json({ error: "Failed to track events" }, 500);
        }
    },
    apiKeyMiddleware
);
