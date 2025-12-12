import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { getAuthenticatedUser } from "~/middleware/auth";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { errorResponse, successResponse } from "~/utils/response.utils.js";
import { OnBoardingService } from "../services/onboarding.service";
import { OnBoardingRepository } from "../repositories/onboarding.repository";
import { ErrorSchema, SuccessSchema } from "../schemas/common.schemas";
import { OrganizationRepository } from "../repositories/organization.repository";
import { UserRepository } from "../repositories/users.repository";
import { EventsRepository } from "../repositories/events.repository";

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
});

export const onBoardingRoutes = new OpenAPIHono();
const onboardingService = new OnBoardingService(
    new OnBoardingRepository(),
    new OrganizationRepository(),
    new UserRepository(),
    new EventsRepository()
);

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
    async (c) => {
        const user = c.get("user");
        const data = c.req.valid("json");
        try {
            const resp = await onboardingService.UpdateOnboarding(user, data);
            return c.json({
                ...resp,
            });
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
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
    async (c) => {
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
    async (c) => {
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
    async (c) => {
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
