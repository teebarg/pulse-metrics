import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema, SuccessSchema } from "~/schemas/common.schemas.js";
import { BatchEventSchema, EventSchema } from "../schemas/event.schemas";
import { errorResponse, successResponse } from "../utils/response.utils";
import { events, organizations } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { db } from "~/db";
import { verifyApiKey } from "~/middleware/auth";

export const eventsRoute = new OpenAPIHono();

eventsRoute.use(verifyApiKey);

eventsRoute.openapi(
    createRoute({
        method: "get",
        path: "/",
        security: [{ Bearer: [] }],
        tags: ["events"],
        description: "Get organization events",
        responses: {
            200: {
                description: "Org Events",
                content: { "application/json": { schema: z.object({ events: z.array(EventSchema) }) } },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c: any) => {
        const organizationId = c.get("organizationId");
        try {
            const res = await db.select().from(events).where(eq(events.organizationId, organizationId));
            return c.json({
                events: res,
            });
        } catch (error: any) {
            console.error("Event ingestion error:", error);
            return errorResponse(c, "Failed to process chat", error.message);
        }
    }
);
