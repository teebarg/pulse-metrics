import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema, SuccessSchema } from "@/api/schemas/common.schemas.js";
import { AnalyticsRepository } from "@/api/repositories/analytics.repository";
import { AnalyticsService } from "@/api/services/analytics.service";

export const analyticsRoutes = new OpenAPIHono();
const analyticsService = new AnalyticsService(new AnalyticsRepository());

analyticsRoutes.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT", // Optional: specify if using JWTs; adjust as needed
});

analyticsRoutes.openAPIRegistry.registerComponent("securitySchemes", "ApiKeyAuth", {
    type: "apiKey",
    in: "header",
    name: "X-API-Key",
});

analyticsRoutes.openapi(
    createRoute({
        method: "get",
        path: "/realtime",
        security: [{ Bearer: [] }, { ApiKeyAuth: [] }],
        tags: ["analytics"],
        description: "Get realtime analytics",
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
        const organizationId = c.get("organizationId");
        try {
            const data = await analyticsService.GetRealtimeAnalytics(organizationId);

            return c.json({
                active_visitors: data.activeVisitors,
                recent_purchases: data.recentPurchases,
                recent_revenue: data.recentRevenue,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Realtime analytics error:", error);
            return c.json({ error: "Failed to fetch realtime data" }, 500);
        }
    }
);

analyticsRoutes.openapi(
    createRoute({
        method: "get",
        path: "/today",
        security: [{ Bearer: [] }, { ApiKeyAuth: [] }],
        tags: ["analytics"],
        description: "Get today analytics",
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
        const organizationId = c.get("organizationId");

        try {
            const data = await analyticsService.GetTodayAnalytics(organizationId);

            return c.json({
                total_events: data.totalEvents || 0,
                unique_visitors: data.uniqueVisitors,
                total_purchases: data.totalPurchases,
                total_revenue: data.totalRevenue,
                conversion_rate: data.uniqueVisitors > 0 ? ((data.totalPurchases / data.uniqueVisitors) * 100).toFixed(2) : 0,
            });
        } catch (error) {
            console.error("Today analytics error:", error);
            return c.json({ error: "Failed to fetch today data" }, 500);
        }
    }
);

analyticsRoutes.openapi(
    createRoute({
        method: "get",
        path: "/top-products",
        security: [{ Bearer: [] }, { ApiKeyAuth: [] }],
        tags: ["analytics"],
        description: "Get top products",
        request: {
            query: z.object({
                days: z.string().default("7").openapi({
                    example: 7,
                    description: "Number of days (max 100)",
                }),
                metric: z.enum(["views", "purchases"]).default("views").openapi({
                    example: "views",
                    description: "Metric to use (views or purchases)",
                }),
            }),
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
        const organizationId = c.get("organizationId");
        const days = parseInt(c.req.query("days") || "7");
        const metric = c.req.query("metric") || "views"; // views or purchases

        try {
            const data = await analyticsService.GetTopProducts(organizationId, days, metric);

            return c.json({ products: data.topProducts });
        } catch (error) {
            console.error("Top products error:", error);
            return c.json({ error: "Failed to fetch top products" }, 500);
        }
    }
);
