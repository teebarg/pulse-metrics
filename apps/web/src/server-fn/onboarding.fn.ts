import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { api } from "~/utils/fetch-api";

export const updateOnboardingStepSchema = z.object({
    step: z.number().int().min(0),
    domain: z.string().optional(),
    name: z.string().optional(),
    platform: z.string().optional(),
    eventsReceived: z.number().int().optional(),
    onboardingCompleted: z.boolean().optional(),
    onboardingCompletedAt: z.date().optional(),
});

export const getOnboardingStatusFn = createServerFn().handler(async () => {
    const res = await api.get<any>("/v1/onboarding/status", { shouldRedirect: true });
    return res;
});

export const updateOnboardingStepFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) => updateOnboardingStepSchema.parse(input))
    .handler(async ({ data }) => {
        const res = await api.patch<{ success: boolean; step: number }>("/v1/onboarding/update", data);
        return res;
    });
