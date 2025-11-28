import { db } from "@/api/db/index.js";
import { analyticsCache, events } from "@/api/db/schema.js";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export class AnalyticsRepository {
    async update(id: string, data: { title: string }) {
        const now = new Date();
        await db
            .update(analyticsCache)
            .set({ ...data, updatedAt: now })
            .where(eq(analyticsCache.id, id));

        const conversation = await db.select().from(analyticsCache).where(eq(analyticsCache.id, id));

        return {
            id: conversation[0].id,
        };
    }

    async delete(id: string) {
        await db.delete(analyticsCache).where(eq(analyticsCache.id, id));
    }

    async getActiveVisitors(organizationId: string) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        try {
            const visitors = await db
                .select({
                    sessionId: events.sessionId,
                })
                .from(events)
                .where(and(eq(events.organizationId, organizationId), gte(events.timestamp, fiveMinutesAgo)));
            const activeVisitors = new Set(visitors.map((v) => v.sessionId)).size;

            return activeVisitors;
        } catch (error) {
            console.error("Error fetching getActiveVisitors:", error);
            return { error: "Failed to fetch getActiveVisitors" };
        }
    }

    async getRecentPurchases(organizationId: string): Promise<any> {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        try {
            const purchases = await db
                .select({
                    properties: events.properties,
                })
                .from(events)
                .where(and(eq(events.organizationId, organizationId), eq(events.eventType, "purchase"), gte(events.timestamp, fiveMinutesAgo)));

            return purchases;
        } catch (error) {
            console.error("Error fetching getRecentPurchases:", error);
            return { error: "Failed to fetch getRecentPurchases" };
        }
    }

    async getTodayEvents(organizationId: string): Promise<any> {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        try {
            const [{ totalEvents }] = await db
                .select({
                    totalEvents: sql<number>`COUNT(*)`,
                })
                .from(events)
                .where(and(eq(events.organizationId, organizationId), gte(events.timestamp, todayStart)));
            return totalEvents;
        } catch (error) {
            console.error("Error fetching getTodayEvents:", error);
            return { error: "Failed to fetch getTodayEvents" };
        }
    }

    async getTodayPurchases(organizationId: string): Promise<any> {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        try {
            const purchases = await db
                .select({ properties: events.properties })
                .from(events)
                .where(and(eq(events.organizationId, organizationId), eq(events.eventType, "purchase"), gte(events.timestamp, todayStart)));

            return purchases;
        } catch (error) {
            console.error("Error fetching purchases in getTodayPurchases:", error);
            return { error: "Failed to fetch getTodayPurchases" };
        }
    }

    async getTodayUniqueVisitors(organizationId: string): Promise<any> {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        try {
            const [{ uniqueVisitors }] = await db
                .select({ uniqueVisitors: sql<number>`COUNT(DISTINCT ${events.sessionId})` })
                .from(events)
                .where(and(eq(events.organizationId, organizationId), gte(events.timestamp, todayStart)));
            return uniqueVisitors;
        } catch (error) {
            console.error("Error fetching purchases:", error);
            return { error: "Failed to fetch purchases" };
        }
    }

    async getTopProducts(organizationId: string, days: number, metric: string): Promise<any> {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        try {
            const eventType = metric === "views" ? "product_view" : "purchase";

            const topProducts = await db
                .select({
                    product_id: sql<string>`properties->>'product_id'`,
                    product_name: sql<string>`COALESCE(properties->>'product_name', 'Unknown')`,
                    count: sql<number>`COUNT(*)`,
                    revenue: sql<number>`SUM(COALESCE((properties->>'revenue')::numeric, 0))`,
                })
                .from(events)
                .where(and(eq(events.organizationId, organizationId), eq(events.eventType, eventType), gte(events.timestamp, startDate)))
                .groupBy(sql`properties->>'product_id'`, sql`properties->>'product_name'`)
                .orderBy(sql`COUNT(*) DESC`)
                .limit(10);

            return topProducts;
        } catch (err) {
            console.error("Top products error:", err);
            return { error: "Failed to fetch top products" };
        }
    }
}
