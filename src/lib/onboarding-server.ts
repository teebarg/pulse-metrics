import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseServerClient } from "./supabase/supabase";
import { db } from "@/api/db";
import { organizations, users } from "@/api/db/schema";
import { eq } from "drizzle-orm";
import { generateApiKey } from "~/api/utils/common.utils";

// Validation schemas
export const updateOnboardingStepSchema = z.object({
    step: z.number().int().min(0),
});

export const completeOnboardingSchema = z.object({
    completed: z.boolean(),
});

export const getOnboardingStatusFn = createServerFn({ method: "GET" }).handler(async () => {
    const supabase = getSupabaseServerClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Not authenticated");
    }

    const dbUser = await db.select().from(users).where(eq(users.id, user.id));

    if (!dbUser[0]) {
        return {
            onboardingCompleted: false,
            onboardingStep: 0,
        };
    }

    return {
        onboardingCompleted: dbUser[0].onboardingCompleted ?? false,
        onboardingStep: dbUser[0].onboardingStep ?? 0,
    };
});

export const updateOnboardingStepFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) => updateOnboardingStepSchema.parse(input))
    .handler(async ({ data }) => {
        const supabase = getSupabaseServerClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            throw new Error("Not authenticated");
        }

        const dbUser = await db.select().from(users).where(eq(users.id, user.id));
        if (!dbUser[0]) {
            const name = user.user_metadata?.name || user.email?.split("@")[0] || "User";
            const org = await db
                .insert(organizations)
                .values({
                    name,
                    domain: user.email?.split("@")[1],
                    apiKey: generateApiKey(),
                })
                .returning({ id: organizations.id });
            await db.insert(users).values({
                id: user.id,
                name,
                email: user.email || "",
                onboardingStep: data.step,
                onboardingCompleted: false,
                organizationId: org[0].id,
            });
        } else {
            await db
                .update(users)
                .set({
                    onboardingStep: data.step,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, user.id));
        }

        return { success: true, step: data.step };
    });

export const completeOnboardingFn = createServerFn({ method: "POST" })
    .inputValidator((input: unknown) => completeOnboardingSchema.parse(input))
    .handler(async ({ data }) => {
        const supabase = getSupabaseServerClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            throw new Error("Not authenticated");
        }

        const dbUser = await db.select().from(users).where(eq(users.id, user.id));
        if (!dbUser[0]) {
            const name = user.user_metadata?.name || user.email?.split("@")[0] || "User";
            const org = await db
                .insert(organizations)
                .values({
                    name,
                    domain: user.email?.split("@")[1],
                    apiKey: generateApiKey(),
                })
                .returning({ id: organizations.id });
            await db.insert(users).values({
                id: user.id,
                name,
                email: user.email || "",
                onboardingStep: 0,
                onboardingCompleted: data.completed,
                organizationId: org[0].id,
            });
        } else {
            await db
                .update(users)
                .set({
                    onboardingCompleted: data.completed,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, user.id));
        }

        return { success: true, completed: data.completed };
    });
