import { z } from "@hono/zod-openapi";

// Event schema validation
export const EventSchema = z.object({
  event_type: z.enum(['page_view', 'product_view', 'add_to_cart', 'checkout', 'purchase']),
  session_id: z.string().optional(),
  user_id: z.string().optional(),
  properties: z.object({
    page: z.string().optional(),
    product_id: z.string().optional(),
    product_name: z.string().optional(),
    price: z.number().optional(),
    quantity: z.number().optional(),
    revenue: z.number().optional(),
    currency: z.string().default('USD'),
    referrer: z.string().optional(),
  }).optional(),
});

// Batch event schema
export const BatchEventSchema = z.object({
  events: z.array(EventSchema).max(100), // Max 100 events per batch
});
