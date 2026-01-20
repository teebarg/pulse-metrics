import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { OrganizationService } from "../services/organization.service.js";
import { OrganizationRepository } from "../repositories/organization.repository.js";
import { UserRepository } from "../repositories/users.repository.js";
import { ErrorSchema, SuccessSchema } from "../schemas/common.schemas.js";
import { errorResponse } from "../utils/response.utils.js";


const OrganizationSchema = z.object({
    name: z.string().optional(),
    step: z.number().int().min(1).max(5).optional(),
    store: z.string().optional(),
    domain: z.string().optional(),
    platform: z.enum(["shopify", "woocommerce", "custom"]).or(z.literal("")).optional(),
});

export const organizationRoutes = new OpenAPIHono();
const organizationService = new OrganizationService(new OrganizationRepository(), new UserRepository());

organizationRoutes.openapi(
    createRoute({
        method: "get",
        path: "/",
        security: [{ Bearer: [] }],
        tags: ["organization"],
        description: "Get organization",
        responses: {
            200: {
                description: "Get organization",
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
            const data = await organizationService.GenerateOrganization(user);
            return c.json(data);
        } catch (error) {
            console.error("Failed to get organization:", error);
            return c.json({ error: "Failed to get organization" }, 500);
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
    async (c: any) => {
        const user = c.get("user");
        const data = c.req.valid("json");
        try {
            const resp = await organizationService.UpdateOrganization(user, data);
            return c.json({
                ...resp,
            });
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);
