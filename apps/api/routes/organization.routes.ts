import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { errorResponse } from "~/utils/response.utils.js";
import { OrganizationService } from "../services/organization.service";
import { ErrorSchema, SuccessSchema } from "../schemas/common.schemas";
import { UserRepository } from "../repositories/users.repository";
import { EventsRepository } from "../repositories/events.repository";
import { OnBoardingRepository } from "../repositories/onboarding.repository";
import { OrganizationRepository } from "../repositories/organization.repository";

const OrganizationSchema = z.object({
    name: z.string().optional(),
    step: z.number().int().min(1).max(5).optional(),
    store: z.string().optional(),
    domain: z.string().optional(),
    platform: z.enum(["shopify", "woocommerce", "custom"]).or(z.literal("")).optional(),
});

export const organizationRoutes = new OpenAPIHono();
const organizationService = new OrganizationService(
    new OnBoardingRepository(),
    new OrganizationRepository(),
    new UserRepository(),
    new EventsRepository()
);

organizationRoutes.openapi(
    createRoute({
        method: "get",
        path: "/",
        security: [{ Bearer: [] }],
        tags: ["organization"],
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
            const data = await organizationService.GenerateOrganization(user);
            return c.json(data);
        } catch (error) {
            console.error("Realtime analytics error:", error);
            return c.json({ error: "Failed to fetch realtime data" }, 500);
        }
    }
);

organizationRoutes.openapi(
    createRoute({
        method: "patch",
        path: "/update",
        security: [{ Bearer: [] }],
        tags: ["organization"],
        description: "Update organization",
        request: {
            body: {
                content: { "application/json": { schema: OrganizationSchema } },
            },
        },
        responses: {
            200: {
                description: "Update organization",
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
            const resp = await organizationService.UpdateOrganization(user, data);
            console.log("🚀 ~ file: organization.routes.ts:98 ~ resp:", resp)
            return c.json({
                ...resp,
            });
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);
