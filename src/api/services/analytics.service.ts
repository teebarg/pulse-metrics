import { AnalyticsRepository } from "@/api/repositories/analytics.repository";

export class AnalyticsService {
    constructor(private analyticsRepo: AnalyticsRepository) {}

    async GetRealtimeAnalytics(userId: string) {
        const [visitorRow, purchaseRow] = await Promise.all([
            this.analyticsRepo.getActiveVisitors(userId),
            this.analyticsRepo.getRecentPurchases(userId),
        ]);

        console.log("🚀 ~ file: analytics.service.ts:8 ~ purchaseRow:", purchaseRow);
        console.log("🚀 ~ file: analytics.service.ts:8 ~ visitorRow:", visitorRow);

        const recentRevenue = purchaseRow[0].reduce((sum, p) => sum + (p.properties?.revenue || 0), 0);
        return {
            activeVisitors: visitorRow.activeVisitors,
            recentPurchases: purchaseRow.purchases?.length || 0,
            recentRevenue,
        };
    }
}
