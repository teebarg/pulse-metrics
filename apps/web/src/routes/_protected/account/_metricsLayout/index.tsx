import { createFileRoute } from "@tanstack/react-router";
import { Activity, DollarSign, ShoppingCart, TrendingUp, Target } from "lucide-react";
import { useState, useMemo } from "react";
import { MetricCard } from "~/components/metrics/MetricCard";
import { EventFeed } from "~/components/metrics/EventFeed";
import { EventChart } from "~/components/metrics/EventChart";
import { FunnelChart } from "~/components/metrics/FunnelChart";
import { TimeRangeSelector } from "~/components/metrics/TimeRangeSelector";
import { EventFilters, FilterState } from "~/components/metrics/EventFilters";
import { getHourlyData, calculateMetrics } from "~/lib/dummy-data";
import { currency } from "~/lib/utils";
import { useStore } from "@tanstack/react-store";
import { store } from "~/utils/store";

export const Route = createFileRoute("/_protected/account/_metricsLayout/")({
    component: RouteComponent,
});

function RouteComponent() {
    const events = useStore(store, (state) => state.events);
    const [timeRange, setTimeRange] = useState("24h");
    const [filters, setFilters] = useState<FilterState>({
        eventType: "all",
        productId: "all",
    });

    const availableProducts = useMemo(() => {
        const productMap = new Map<string, string>();
        events?.forEach((e) => {
            if (e.metadata.product_id && e.metadata.product_name) {
                productMap.set(e.metadata.product_id, e.metadata.product_name);
            }
        });
        return Array.from(productMap.entries()).map(([id, name]) => ({ id, name }));
    }, [events]);

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            if (filters.eventType !== "all" && event.eventType !== filters.eventType) {
                return false;
            }
            if (filters.productId !== "all" && event.metadata.product_id !== filters.productId) {
                return false;
            }
            return true;
        });
    }, [events, filters]);

    const metrics = calculateMetrics(filteredEvents);
    const hourlyData = getHourlyData(filteredEvents);
    return (
        <main className="container mx-auto px-6 py-8 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
                    <p className="text-muted-foreground">Monitor your store's performance in real-time</p>
                </div>
                <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
            </div>

            <div className="mb-6">
                <EventFilters filters={filters} onFiltersChange={setFilters} availableProducts={availableProducts} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <MetricCard
                    title="Total Events"
                    value={metrics.totalEvents.toLocaleString()}
                    subtitle="All tracked events"
                    icon={Activity}
                    trend={{ value: 12.5, isPositive: true }}
                    accentColor="primary"
                />
                <MetricCard
                    title="Revenue"
                    value={currency(metrics.totalRevenue)}
                    subtitle="From purchases"
                    icon={DollarSign}
                    trend={{ value: 8.2, isPositive: true }}
                    accentColor="purchase"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${metrics.conversionRate}%`}
                    subtitle="Page view → Purchase"
                    icon={Target}
                    trend={{ value: 2.1, isPositive: true }}
                    accentColor="primary"
                />
                <MetricCard
                    title="Cart → Checkout"
                    value={`${metrics.cartToCheckout}%`}
                    subtitle="Checkout rate"
                    icon={ShoppingCart}
                    trend={{ value: 1.8, isPositive: false }}
                    accentColor="cart"
                />
                <MetricCard
                    title="Avg Order Value"
                    value={currency(Number(metrics.avgOrderValue))}
                    subtitle="Per purchase"
                    icon={TrendingUp}
                    trend={{ value: 5.4, isPositive: true }}
                    accentColor="purchase"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <EventChart data={hourlyData} className="lg:col-span-2" />
                <FunnelChart data={metrics.counts} />
            </div>
            <EventFeed events={filteredEvents} />
        </main>
    );
}
