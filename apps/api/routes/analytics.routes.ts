import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";
import { AnalyticsService } from "../services/analytics.service.js";
import { AnalyticsRepository } from "../repositories/analytics.repository.js";
import { EcommerceService } from "../services/ecommerce.service.js";
import { ErrorSchema, SuccessSchema } from "../schemas/common.schemas.js";

export const analyticsRoutes = new OpenAPIHono();
const analyticsService = new AnalyticsService(new AnalyticsRepository());
const ecommerceService = new EcommerceService();

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
    async (c: Context) => {
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
    async (c: Context) => {
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
    async (c: Context) => {
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

analyticsRoutes.openapi(
    createRoute({
        method: "get",
        path: "/metrics",
        security: [{ Bearer: [] }],
        tags: ["analytics"],
        description: "Get e-commerce metrics and analytics",
        request: {
            query: z.object({
                timeRange: z.enum(["24h", "7d", "30d"]).default("24h").openapi({
                    example: "24h",
                    description: "Time range for the metrics (24h, 7d, 30d)",
                }),
            }),
        },
        responses: {
            200: {
                description: "E-commerce metrics",
                content: {
                    "application/json": {
                        schema: z.object({
                            totalRevenue: z.number(),
                            totalOrders: z.number(),
                            averageOrderValue: z.number(),
                            conversionRate: z.number(),
                            topProducts: z.array(
                                z.object({
                                    productId: z.string(),
                                    name: z.string(),
                                    views: z.number(),
                                    addToCarts: z.number(),
                                    purchases: z.number(),
                                    revenue: z.number(),
                                    conversionRate: z.number(),
                                })
                            ),
                            hourlyData: z.array(
                                z.object({
                                    hour: z.string(),
                                    pageViews: z.number(),
                                    productViews: z.number(),
                                    addToCarts: z.number(),
                                    checkouts: z.number(),
                                    purchases: z.number(),
                                })
                            ),
                            recentEvents: z.array(
                                z.object({
                                    id: z.string(),
                                    eventType: z.string(),
                                    timestamp: z.string(),
                                    metadata: z.any(),
                                })
                            ),
                        }),
                    },
                },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c: Context) => {
        const organizationId = c.get("organizationId");
        const timeRange = c.req.query("timeRange") as "24h" | "7d" | "30d";

        try {
            const metrics = (await ecommerceService.getMetrics(organizationId, timeRange)) as unknown as any;
            return c.json(metrics);
        } catch (error) {
            console.error("E-commerce metrics error:", error);
            return c.json({ error: "Failed to fetch e-commerce metrics" }, 500);
        }
    }
);

analyticsRoutes.openapi(
    createRoute({
        method: "get",
        path: "/events/realtime",
        security: [{ Bearer: [] }],
        tags: ["analytics"],
        description: "Stream real-time e-commerce events",
        responses: {
            200: {
                description: "Real-time event stream",
                content: {
                    "text/event-stream": {
                        schema: {
                            type: "string",
                            format: "binary",
                        },
                    },
                },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c: Context) => {
        const organizationId = c.get("organizationId");

        // Set headers for Server-Sent Events
        c.header("Content-Type", "text/event-stream");
        c.header("Cache-Control", "no-cache");
        c.header("Connection", "keep-alive");

        // Create a simple stream that sends a ping every 5 seconds
        const stream = new ReadableStream({
            async start(controller) {
                // Send initial data
                const initialData = await ecommerceService.getMetrics(organizationId, "24h");
                controller.enqueue(`data: ${JSON.stringify(initialData)}\n\n`);

                // Set up interval for updates
                const interval = setInterval(async () => {
                    try {
                        const data = await ecommerceService.getMetrics(organizationId, "24h");
                        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
                    } catch (error) {
                        console.error("Error in real-time stream:", error);
                        controller.enqueue(`event: error\ndata: ${JSON.stringify({ error: "Error fetching real-time data" })}\n\n`);
                    }
                }, 5000);

                // Clean up on stream close
                return () => {
                    clearInterval(interval);
                };
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    }
);
