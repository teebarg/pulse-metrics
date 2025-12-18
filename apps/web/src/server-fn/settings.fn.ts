import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { api } from "~/utils/fetch-api";

export interface Settings {
    name?: string;
    apiKey?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SettingsResponse {
    settings: Settings;
}

export const getSettingsFn = createServerFn().handler(async () => {
    return await api.get<Settings>("/v1/settings");
});

export const updateSettingsFn = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            name: z.string().optional(),
            apiKey: z.string().optional(),
        })
    )
    .handler(async ({ data }) => {
        return await api.patch<Settings>("/v1/settings", { params: data });
    });
