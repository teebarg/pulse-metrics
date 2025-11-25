import { AnalyticsRepository } from "@/api/repositories/analytics.repository";

export class AnalyticsService {
    constructor(private analyticsRepo: AnalyticsRepository) {}

    async GetRealtimeAnalytics(organizationId: string) {
        const [activeVisitors, purchases] = await Promise.all([
            this.analyticsRepo.getActiveVisitors(organizationId),
            this.analyticsRepo.getRecentPurchases(organizationId),
        ]);

        const recentRevenue = purchases.reduce((sum: number, p: any) => sum + (p.properties?.revenue || 0), 0);
        return {
            activeVisitors,
            recentPurchases: purchases.length,
            recentRevenue,
        };
    }
}
