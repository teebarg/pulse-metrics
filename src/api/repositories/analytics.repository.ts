import { db } from "@/api/db/index.js";
import { analyticsCache, events } from "@/api/db/schema.js";
import { eq, desc, and, gte } from "drizzle-orm";

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
            console.error("Error fetching analytics:", error);
            return { error: "Failed to fetch analytics" };
        }
    }

    async getRecentPurchases(organizationId: string) : Promise<any> {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        try {
            const purchases = await db
                .select({
                    properties: events.properties,
                })
                .from(events)
                .where(and(eq(events.organizationId, organizationId), eq(events.eventType, "purchase"), gte(events.timestamp, fiveMinutesAgo)));

            return purchases ;
        } catch (error) {
            console.error("Error fetching purchases:", error);
            return { error: "Failed to fetch purchases" };
        }
    }
}
