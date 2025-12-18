import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { getAuthenticatedUser } from "~/middleware/auth";
import { errorResponse, successResponse } from "~/utils/response.utils";
import { getSettings, updateSettings } from "~/services/settings.service";
import { SettingsResponseSchema, UpdateSettingsRequestSchema } from "~/schemas/settings.schemas";

export const settingsRoutes = new OpenAPIHono();

// GET /v1/settings
export const getSettingsRoute = createRoute({
    method: 'get',
    path: '/settings',
    security: [{ Bearer: [] }],
    tags: ['settings'],
    responses: {
        200: {
            description: 'Get user settings',
            content: {
                'application/json': {
                    schema: SettingsResponseSchema
                }
            }
        }
    }
});

settingsRoutes.openapi(getSettingsRoute, async (c) => {
    try {
        const user = await getAuthenticatedUser(c);
        const settings = await getSettings(user.id);
        return successResponse(c, { settings });
    } catch (error: any) {
        return errorResponse(c, error.message, error.details, error.statusCode || 500);
    }
});

// PATCH /v1/settings
export const updateSettingsRoute = createRoute({
    method: 'patch',
    path: '/settings',
    security: [{ Bearer: [] }],
    tags: ['settings'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: UpdateSettingsRequestSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Update user settings',
            content: {
                'application/json': {
                    schema: SettingsResponseSchema
                }
            }
        }
    }
});

settingsRoutes.openapi(updateSettingsRoute, async (c) => {
    try {
        const user = await getAuthenticatedUser(c);
        const data = await c.req.json();
        
        const settings = await updateSettings(user.id, data);
        return successResponse(c, { settings });
    } catch (error: any) {
        return errorResponse(c, error.message, error.details, error.statusCode || 500);
    }
});
