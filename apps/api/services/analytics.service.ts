import { AnalyticsRepository } from "~/repositories/analytics.repository";

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

    async GetTodayAnalytics(organizationId: string) {
        const [totalEvents, totalPurchasesData, uniqueVisitors] = await Promise.all([
            this.analyticsRepo.getTodayEvents(organizationId),
            this.analyticsRepo.getTodayPurchases(organizationId),
            this.analyticsRepo.getTodayUniqueVisitors(organizationId),
        ]);

        const totalRevenue = totalPurchasesData.reduce((sum: number, p: any) => sum + ((p.properties as any)?.revenue || 0), 0);
        return {
            totalEvents,
            totalPurchases: totalPurchasesData.length,
            totalRevenue,
            uniqueVisitors,
        };
    }

    async GetTopProducts(organizationId: string, days: number, metric: string) {
        const topProducts = await this.analyticsRepo.getTopProducts(organizationId, days, metric);

        return {
            topProducts,
        };
    }
}
