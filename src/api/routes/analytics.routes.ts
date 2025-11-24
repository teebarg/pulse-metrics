import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { ErrorSchema, SuccessSchema } from "@/api/schemas/common.schemas.js";
import { createClient } from "@supabase/supabase-js";
import { EventSchema } from "@/api/schemas/event.schemas";
import { AnalyticsRepository } from "@/api/repositories/analytics.repository";
import { AnalyticsService } from "@/api/services/analytics.service";

export const analyticsRoutes = new OpenAPIHono();
const analyticsService = new AnalyticsService(new AnalyticsRepository());

analyticsRoutes.openapi(
    createRoute({
        method: "get",
        path: "/realtime",
        security: [{ Bearer: [] }],
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
        console.log("🚀 ~ file: analytics.routes.ts:36 ~ organizationId:", organizationId)

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
        security: [{ Bearer: [] }],
        tags: ["events"],
        description: "Create an event",
        request: {
            body: {
                content: { "application/json": { schema: EventSchema } },
            },
        },
        responses: {
            200: {
                description: "Chat stream",
                content: { "text/event-stream": { schema: z.any() } },
            },
            500: {
                description: "Server error",
                content: { "application/json": { schema: ErrorSchema } },
            },
        },
    }),
    async (c) => {
        const organizationId = c.get("organizationId");
        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        try {
            // Total events today
            const { count: totalEvents } = await supabase
                .from("events")
                .select("*", { count: "exact", head: true })
                .eq("organization_id", organizationId)
                .gte("timestamp", todayStart.toISOString());

            // Purchases today
            const { data: purchases, error } = await supabase
                .from("events")
                .select("properties")
                .eq("organization_id", organizationId)
                .eq("event_type", "purchase")
                .gte("timestamp", todayStart.toISOString());

            if (error) throw error;

            const totalPurchases = purchases.length;
            const totalRevenue = purchases.reduce((sum, p) => sum + (p.properties?.revenue || 0), 0);

            // Unique visitors
            const { data: sessions } = await supabase
                .from("events")
                .select("session_id")
                .eq("organization_id", organizationId)
                .gte("timestamp", todayStart.toISOString());

            const uniqueVisitors = new Set(sessions?.map((s) => s.session_id)).size;

            return c.json({
                total_events: totalEvents || 0,
                unique_visitors: uniqueVisitors,
                total_purchases: totalPurchases,
                total_revenue: totalRevenue,
                conversion_rate: uniqueVisitors > 0 ? ((totalPurchases / uniqueVisitors) * 100).toFixed(2) : 0,
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
        security: [{ Bearer: [] }],
        tags: ["events"],
        description: "Create an event",
        request: {
            body: {
                content: { "application/json": { schema: EventSchema } },
            },
        },
        responses: {
            200: {
                description: "Chat stream",
                content: { "text/event-stream": { schema: z.any() } },
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

        const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        try {
            const eventType = metric === "views" ? "product_view" : "purchase";

            const { data: events, error } = await supabase
                .from("events")
                .select("properties")
                .eq("organization_id", organizationId)
                .eq("event_type", eventType)
                .gte("timestamp", startDate);

            if (error) throw error;

            // Aggregate by product
            const productCounts = events.reduce((acc, event) => {
                const productId = event.properties?.product_id;
                const productName = event.properties?.product_name;

                if (productId) {
                    if (!acc[productId]) {
                        acc[productId] = {
                            product_id: productId,
                            product_name: productName || "Unknown",
                            count: 0,
                            revenue: 0,
                        };
                    }
                    acc[productId].count++;
                    acc[productId].revenue += event.properties?.revenue || 0;
                }
                return acc;
            }, {});

            const topProducts = Object.values(productCounts)
                .sort((a: any, b: any) => b.count - a.count)
                .slice(0, 10);

            return c.json({ products: topProducts });
        } catch (error) {
            console.error("Top products error:", error);
            return c.json({ error: "Failed to fetch top products" }, 500);
        }
    }
);
