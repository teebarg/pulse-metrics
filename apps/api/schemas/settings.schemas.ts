import { z } from "@hono/zod-openapi";

export const SettingsSchema = z.object({
    userId: z.string().optional(),
    soundEnabled: z.boolean().optional(),
    browserNotificationsEnabled: z.boolean().optional(),
    highValueThreshold: z.number().optional(),
    activitySpikeMultiplier: z.number().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});


export const UpdateSettingsRequestSchema = z.object({
    soundEnabled: z.boolean().optional(),
    browserNotificationsEnabled: z.boolean().optional(),
    highValueThreshold: z.number().optional(),
    activitySpikeMultiplier: z.number().optional(),
});

export const SettingsResponseSchema = z.object({
    settings: SettingsSchema,
});
