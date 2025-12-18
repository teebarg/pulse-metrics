import { z } from "@hono/zod-openapi";

export const SettingsSchema = z.object({
    apiKey: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});


export const UpdateSettingsRequestSchema = z.object({
    apiKey: z.string().optional(),
});

export const SettingsResponseSchema = z.object({
    settings: SettingsSchema,
});
