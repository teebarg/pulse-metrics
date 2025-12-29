import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { getAuthenticatedUser } from "../middleware/auth.js";
import { errorResponse, successResponse } from "../utils/response.utils.js";
import { getSettings, updateSettings } from "../services/settings.service.js";
import { SettingsResponseSchema, UpdateSettingsRequestSchema } from "../schemas/settings.schemas.js";
import { authMiddleware } from "../middleware/auth.js";
import { ErrorSchema } from "../schemas/common.schemas.js";

export const settingsRoutes = new OpenAPIHono();

settingsRoutes.openapi(
    createRoute({
        method: "get",
        path: "/",
        security: [{ Bearer: [] }],
        tags: ["settings"],
        middleware: [authMiddleware],
        description: "Get user settings",
        responses: {
            200: {
                description: "Get user settings",
                content: {
                    "application/json": {
                        schema: SettingsResponseSchema,
                    },
                },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c: any) => {
        try {
            const user = await getAuthenticatedUser(c);
            const settings = await getSettings(user.id);
            return c.json({ ...settings });
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);

settingsRoutes.openapi(
    createRoute({
        method: "patch",
        path: "/",
        security: [{ Bearer: [] }],
        tags: ["settings"],
        middleware: [authMiddleware],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: UpdateSettingsRequestSchema,
                    },
                },
            },
        },
        responses: {
            200: {
                description: "Update user settings",
                content: {
                    "application/json": {
                        schema: SettingsResponseSchema,
                    },
                },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c: any) => {
        try {
            const user = await getAuthenticatedUser(c);
            const data = await c.req.json();

            await updateSettings(user.id, data);
            return c.json({ message: "Settings updated successfully" });
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);
