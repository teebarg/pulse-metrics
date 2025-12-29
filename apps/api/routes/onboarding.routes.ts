import { OpenAPIHono, createRoute } from "@hono/zod-openapi";;
import { z } from "zod";
import { OnBoardingService } from "../services/onboarding.service.js";
import { OrganizationRepository } from "../repositories/organization.repository.js";
import { UserRepository } from "../repositories/users.repository.js";
import { ErrorSchema, SuccessSchema } from "../schemas/common.schemas.js";

const completeOnboardingSchema = z.object({
    store: z.string().min(1),
    domain: z.string().url().optional(),
    platform: z.enum(["shopify", "woocommerce", "custom"]),
});

const OnboardingSchema = z.object({
    name: z.string().optional(),
    step: z.number().int().min(1).max(5).optional(),
    store: z.string().optional(),
    domain: z.string().optional(),
    platform: z.enum(["shopify", "woocommerce", "custom"]).or(z.literal("")).optional(),
    onboardingCompleted: z.boolean().optional(),
});

export const onBoardingRoutes = new OpenAPIHono();
const onboardingService = new OnBoardingService(new OrganizationRepository(), new UserRepository());

onBoardingRoutes.openapi(
    createRoute({
        method: "patch",
        path: "/update",
        security: [{ Bearer: [] }],
        tags: ["onboarding"],
        description: "Update organization onboarding",
        request: {
            body: {
                content: { "application/json": { schema: OnboardingSchema } },
            },
        },
        responses: {
            200: {
                description: "Get Today Analytics",
                content: { "application/json": { schema: SuccessSchema } },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c: any) => {
        const user = c.get("user");
        const data = c.req.valid("json");
        try {
            const resp = await onboardingService.UpdateOnboarding(user, data);
            return c.json({
                ...resp,
            });
        } catch (error: any) {
            return c.json({ error: error.message }, 500);
        }
    }
);

onBoardingRoutes.openapi(
    createRoute({
        method: "post",
        path: "/complete",
        security: [{ Bearer: [] }],
        tags: ["onboarding"],
        description: "Complete organization onboarding",
        request: {
            body: {
                content: { "application/json": { schema: completeOnboardingSchema } },
            },
        },
        responses: {
            200: {
                description: "Chat stream",
                content: { "application/json": { schema: SuccessSchema } },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c: any) => {
        const user = c.get("user");
        const body = await c.req.json();
        try {
            await onboardingService.CompleteOnboarding(user, body);

            return c.json({ success: true });
        } catch (error) {
            console.error("Realtime analytics error:", error);
            return c.json({ error: "Failed to fetch realtime data" }, 500);
        }
    }
);

onBoardingRoutes.openapi(
    createRoute({
        method: "get",
        path: "/verify",
        security: [{ Bearer: [] }],
        tags: ["onboarding"],
        description: "Verify organization events",
        responses: {
            200: {
                description: "Verify organization events",
                content: { "application/json": { schema: SuccessSchema } },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c: any) => {
        const user = c.get("user");
        try {
            const data = await onboardingService.VerifyEvents(user);

            return c.json({ ...data });
        } catch (error) {
            console.error("Realtime analytics error:", error);
            return c.json({ error: "Failed to fetch realtime data" }, 500);
        }
    }
);

onBoardingRoutes.openapi(
    createRoute({
        method: "get",
        path: "/status",
        security: [{ Bearer: [] }],
        tags: ["onboarding"],
        description: "Verify organization events",
        responses: {
            200: {
                description: "Verify organization events",
                content: { "application/json": { schema: SuccessSchema } },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c: any) => {
        const user = c.get("user");
        try {
            const data = await onboardingService.OnboardingStatus(user);

            return c.json({ ...data });
        } catch (error) {
            console.error("Realtime analytics error:", error);
            return c.json({ error: "Failed to fetch realtime data" }, 500);
        }
    }
);
