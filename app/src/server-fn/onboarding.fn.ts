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

export const completeOnboardingSchema = z.object({
    completed: z.boolean(),
});

export const getOnboardingStatusFn = createServerFn().handler(async () => {
    console.log("calling endpoint............");
    const res = await api.get<any>("/v1/onboarding/status");
    console.log("🚀 ~ file: onboarding.fn.ts:21 ~ res:", res);
    return res;
});

export const updateOnboardingStepFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) => updateOnboardingStepSchema.parse(input))
    .handler(async ({ data }) => {
        console.log("🚀 ~ file: onboarding-server.ts:66 ~ data:", data);
        return await api.patch<{ success: boolean; step: number }>("/v1/onboarding/update", { params: data });
    });

export const completeOnboardingFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) => completeOnboardingSchema.parse(input))
    .handler(async ({ data }) => {
        return await api.post<{ success: boolean; step: number }>("/v1/onboarding/complete", { params: data });
    });
