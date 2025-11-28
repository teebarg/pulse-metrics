import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema, SuccessSchema } from "@/api/schemas/common.schemas.js";
import { BatchEventSchema, EventSchema } from "../schemas/event.schemas";
import { createClient } from "@supabase/supabase-js";
import { errorResponse, successResponse } from "../utils/response.utils";

export const eventsRoute = new OpenAPIHono();

eventsRoute.openapi(
    createRoute({
        method: "post",
        path: "/events",
        security: [{ Bearer: [] }],
        tags: ["events"],
        description: "Create an event",
        request: {
            body: {
                content: { "application/json": { schema: EventSchema } },
            },
        },
        responses: {
            200: {
                description: "Chat stream",
                content: { "text/event-stream": { schema: z.any() } },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c) => {
        const event = c.req.valid('json');
        const organizationId = c.get('organizationId');
        
        const supabase = createClient(
            c.env.SUPABASE_URL,
            c.env.SUPABASE_SERVICE_ROLE_KEY
        );

        try {
            // Insert event
            const { error } = await supabase
                .from('events')
                .insert({
                    organization_id: organizationId,
                    event_type: event.event_type,
                    session_id: event.session_id,
                    user_id: event.user_id,
                    properties: event.properties,
                    timestamp: new Date().toISOString(),
                });

            if (error) throw error;

            // Increment usage counter
            await supabase
                .from('organizations')
                .update({ events_used: supabase.raw('events_used + 1') })
                .eq('id', organizationId);

            return successResponse(c, { success: true, message: 'Event tracked' });
        } catch (error: any) {
            console.error('Event ingestion error:', error);
            return errorResponse(c, "Failed to process chat", error.message);
        }
    }
);


eventsRoute.openapi(
    createRoute({
        method: "post",
        path: "/events/batch",
        security: [{ Bearer: [] }],
        tags: ["events"],
        description: "Create an event",
        request: {
            body: {
                content: { "application/json": { schema: BatchEventSchema } },
            },
        },
        responses: {
            200: {
                description: "Chat stream",
                content: { "text/event-stream": { schema: z.any() } },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c) => {
        const { events } = c.req.valid('json');
        const organizationId = c.get('organizationId');
        
        const supabase = createClient(
        c.env.SUPABASE_URL,
        c.env.SUPABASE_SERVICE_ROLE_KEY
        );

        try {
            const eventRecords = events.map(event => ({
                organization_id: organizationId,
                event_type: event.event_type,
                session_id: event.session_id,
                user_id: event.user_id,
                properties: event.properties,
                timestamp: new Date().toISOString(),
            }));

            const { error } = await supabase
                .from('events')
                .insert(eventRecords);

            if (error) throw error;

            // Update usage counter
            await supabase
                .from('organizations')
                .update({ events_used: supabase.raw(`events_used + ${events.length}`) })
                .eq('id', organizationId);

            return c.json({ 
                success: true, 
                message: `${events.length} events tracked` 
            }, 201);
        } catch (error) {
            console.error('Batch ingestion error:', error);
            return c.json({ error: 'Failed to track events' }, 500);
        }
    }
);
