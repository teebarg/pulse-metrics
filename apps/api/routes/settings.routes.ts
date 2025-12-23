import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { getAuthenticatedUser } from "~/middleware/auth";
import { errorResponse, successResponse } from "~/utils/response.utils";
import { getSettings, updateSettings } from "~/services/settings.service";
import { SettingsResponseSchema, UpdateSettingsRequestSchema } from "~/schemas/settings.schemas";
import { authMiddleware } from "~/middleware/auth";

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
        },
    }),
    async (c: any) => {
        try {
            const user = await getAuthenticatedUser(c);
            const settings = await getSettings(user.id);
            return successResponse(c, { settings });
        } catch (error: any) {
            console.log("🚀 ~ file: settings.routes.ts:35 ~ error:", error)
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
        },
    }),
    async (c) => {
        try {
            const user = await getAuthenticatedUser(c);
            const data = await c.req.json();

            const settings = await updateSettings(user.id, data);
            return successResponse(c, { settings });
        } catch (error: any) {
            return errorResponse(c, error.message, error.details, error.statusCode || 500);
        }
    }
);
