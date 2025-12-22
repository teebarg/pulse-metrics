import { db } from "../db";
import { events } from "../db/schema";
import { and, eq, gte, sql, desc } from "drizzle-orm";
import { z } from "zod";

// Schema for product metrics
export const ProductMetricsSchema = z.object({
    product_id: z.string(),
    product_name: z.string().optional(),
    eventType: z.string(),
    count: z.number(),
    total_value: z.number().default(0)
});

export type ProductMetrics = z.infer<typeof ProductMetricsSchema>;

export class EcommerceRepository {
    async getEventsByType(organizationId: string, eventType: string, fromDate: Date) {
        return db
            .select()
            .from(events)
            .where(
                and(
                    eq(events.organizationId, organizationId),
                    eq(events.eventType, eventType),
                    gte(events.timestamp, fromDate)
                )
            )
            .orderBy(desc(events.timestamp));
    }

    async getProductMetrics(organizationId: string, fromDate: Date): Promise<ProductMetrics[]> {
        const result = await db.execute(sql`
            SELECT 
                metadata->>'product_id' as product_id,
                metadata->>'product_name' as product_name,
                eventType,
                COUNT(*) as count,
                COALESCE(SUM(CAST(metadata->>'order_value' AS DECIMAL)), 0) as total_value
            FROM events
            WHERE 
                organization_id = ${organizationId}
                AND timestamp >= ${fromDate}
                AND metadata->>'product_id' IS NOT NULL
            GROUP BY 
                metadata->>'product_id',
                metadata->>'product_name',
                eventType
        `);

        return ProductMetricsSchema.array().parse(result.rows);
    }

    async getHourlyMetrics(organizationId: string, fromDate: Date) {
        const result = await db.execute(sql`
            SELECT 
                to_char(timestamp, 'HH12:00 AM') as hour,
                eventType as eventType,
                COUNT(*) as count
            FROM events
            WHERE 
                organization_id = ${organizationId}
                AND timestamp >= ${fromDate}
            GROUP BY 
                to_char(timestamp, 'HH12:00 AM'),
                eventType
            ORDER BY hour
        `);

        return result.rows as Array<{
            hour: string;
            eventType: string;
            count: number;
        }>;
    }

    async getRecentEvents(organizationId: string, limit: number = 10) {
        return db
            .select()
            .from(events)
            .where(
                and(
                    eq(events.organizationId, organizationId)
                )
            )
            .orderBy(desc(events.timestamp))
            .limit(limit);
    }
}
