import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { api } from "~/utils/fetch-api";

export interface Settings {
    createdAt?: string;
    updatedAt?: string;
    soundEnabled: boolean;
    browserNotificationsEnabled: boolean;
    highValueThreshold: number;
    activitySpikeMultiplier: number;
}

export const getSettingsFn = createServerFn().handler(async () => {
    return await api.get<{ settings: Settings }>("/v1/settings");
});

export const updateSettingsFn = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            soundEnabled: z.boolean().optional(),
            browserNotificationsEnabled: z.boolean().optional(),
            highValueThreshold: z.number().optional(),
            activitySpikeMultiplier: z.number().optional(),
        })
    )
    .handler(async ({ data }) => {
        return await api.patch<Settings>("/v1/settings", data);
    });
