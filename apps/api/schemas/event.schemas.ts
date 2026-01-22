import { z } from "@hono/zod-openapi";

export const EventSchema = z.object({
    eventType: z.enum(["page_view", "product_view", "add_to_cart", "checkout", "purchase"]),
    sessionId: z.string().optional(),
    metadata: z
        .object({
            page: z.string().optional(),
            product_id: z.string().optional(),
            product_name: z.string().optional(),
            price: z.coerce.number().optional(),
            cart_value: z.coerce.number().optional(),
            order_value: z.coerce.number().optional(),
            quantity: z.number().optional(),
            revenue: z.number().optional(),
            referrer: z.string().optional(),
        })
        .optional(),
});

export const BatchEventSchema = z.object({
    events: z.array(EventSchema).max(100),
});
