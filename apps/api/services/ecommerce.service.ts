import { db } from "~/db";
import { events } from "~/db/schema";
import { eq, and, gte, sql, count, sum, desc } from "drizzle-orm";
import { z } from "zod";

const TimeRangeSchema = z.enum(["24h", "7d", "30d"]);

export interface EcommerceMetrics {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    topProducts: Array<{
        productId: string;
        name: string;
        views: number;
        addToCarts: number;
        purchases: number;
        revenue: number;
        conversionRate: number;
    }>;
    hourlyData: Array<{
        hour: string;
        pageViews: number;
        productViews: number;
        addToCarts: number;
        checkouts: number;
        purchases: number;
    }>;
    recentEvents: Array<{
        id: string;
        eventType: string;
        timestamp: Date;
        metadata: any;
    }>;
}

export class EcommerceService {
    async getMetrics(organizationId: string, timeRange: z.infer<typeof TimeRangeSchema> = "24h"): Promise<EcommerceMetrics> {
        // Calculate time range
        const now = new Date();
        let fromDate = new Date(now);
        
        switch (timeRange) {
            case "24h":
                fromDate.setHours(now.getHours() - 24);
                break;
            case "7d":
                fromDate.setDate(now.getDate() - 7);
                break;
            case "30d":
                fromDate.setDate(now.getDate() - 30);
                break;
            default:
                fromDate.setHours(now.getHours() - 24);
        }

        // Get all events in the time range
        const allEvents = await db
            .select()
            .from(events)
            .where(
                and(
                    eq(events.organizationId, organizationId),
                    gte(events.timestamp, fromDate)
                )
            )
            .orderBy(desc(events.timestamp));

        // Calculate metrics
        let totalRevenue = 0;
        let totalOrders = 0;
        let totalProductViews = 0;
        let totalAddToCarts = 0;
        
        const productMetrics = new Map<string, {
            name: string;
            views: number;
            addToCarts: number;
            purchases: number;
            revenue: number;
        }>();

        allEvents.forEach(event => {
            const metadata = event.properties as any;
            
            // Track product metrics
            if (metadata.product_id) {
                const productId = metadata.product_id;
                const productName = metadata.product_name || 'Unknown Product';
                
                if (!productMetrics.has(productId)) {
                    productMetrics.set(productId, {
                        name: productName,
                        views: 0,
                        addToCarts: 0,
                        purchases: 0,
                        revenue: 0
                    });
                }
                
                const product = productMetrics.get(productId)!;
                
                if (event.eventType === 'product_view') {
                    product.views++;
                    totalProductViews++;
                } else if (event.eventType === 'add_to_cart') {
                    product.addToCarts++;
                    totalAddToCarts++;
                } else if (event.eventType === 'purchase' && metadata.order_value) {
                    product.purchases++;
                    product.revenue += parseFloat(metadata.order_value);
                    totalRevenue += parseFloat(metadata.order_value);
                    totalOrders++;
                }
            } else if (event.eventType === 'purchase' && metadata.order_value) {
                // Handle purchases without product_id (shouldn't happen but just in case)
                totalRevenue += parseFloat(metadata.order_value);
                totalOrders++;
            }
        });

        // Calculate hourly data
        const hourlyData = this.calculateHourlyData(allEvents);

        // Prepare top products
        const topProducts = Array.from(productMetrics.entries())
            .map(([productId, metrics]) => ({
                productId,
                name: metrics.name,
                views: metrics.views,
                addToCarts: metrics.addToCarts,
                purchases: metrics.purchases,
                revenue: metrics.revenue,
                conversionRate: metrics.views > 0 ? (metrics.purchases / metrics.views) * 100 : 0
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5); // Top 5 products by revenue

        // Get recent events (latest 10)
        const recentEvents = allEvents
            .slice(0, 10)
            .map(event => ({
                id: event.id,
                eventType: event.eventType,
                timestamp: event.timestamp,
                metadata: event.properties
            }));

        return {
            totalRevenue,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            conversionRate: totalProductViews > 0 ? (totalOrders / totalProductViews) * 100 : 0,
            topProducts,
            hourlyData,
            recentEvents
        };
    }

    private calculateHourlyData(events: any[]) {
        const now = new Date();
        const hourlyData = new Map<string, {
            hour: string;
            pageViews: number;
            productViews: number;
            addToCarts: number;
            checkouts: number;
            purchases: number;
        }>();

        // Initialize last 24 hours
        for (let i = 0; i < 24; i++) {
            const hour = new Date(now);
            hour.setHours(now.getHours() - i, 0, 0, 0);
            const hourStr = hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
            
            hourlyData.set(hourStr, {
                hour: hourStr,
                pageViews: 0,
                productViews: 0,
                addToCarts: 0,
                checkouts: 0,
                purchases: 0
            });
        }

        // Count events by hour
        events.forEach(event => {
            const eventHour = new Date(event.timestamp);
            const hourStr = eventHour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
            
            const hourData = hourlyData.get(hourStr);
            if (!hourData) return;

            switch (event.eventType) {
                case 'page_view':
                    hourData.pageViews++;
                    break;
                case 'product_view':
                    hourData.productViews++;
                    break;
                case 'add_to_cart':
                    hourData.addToCarts++;
                    break;
                case 'checkout':
                    hourData.checkouts++;
                    break;
                case 'purchase':
                    hourData.purchases++;
                    break;
            }
        });

        return Array.from(hourlyData.values()).reverse(); // Return in chronological order
    }
}
