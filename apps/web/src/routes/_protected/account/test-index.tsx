import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, DollarSign, ShoppingCart, TrendingUp, Target } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Header } from "@/components/metrics/Header";
import { MetricCard } from "@/components/metrics/MetricCard";
import { EventFeed } from "@/components/metrics/EventFeed";
import { EventChart } from "@/components/metrics/EventChart";
import { FunnelChart } from "@/components/metrics/FunnelChart";
import { TimeRangeSelector } from "@/components/metrics/TimeRangeSelector";
import { EventFilters, FilterState } from "@/components/metrics/EventFilters";
import { useNotifications } from "@/hooks/useNotifications";
import { getHourlyData, calculateMetrics, AnalyticsEvent } from "@/lib/dummy-data";
import { useWebSocket } from "pulsews";
import { getOrgEventsFn } from "~/server-fn/event.fn";
import { useSuspenseQuery } from "@tanstack/react-query";
import { currency } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { usePulseMetrics } from "~/hooks/usePulseMetrics";

const orgEventsQueryOptions = () => ({
    queryKey: ["organization", "events"],
    queryFn: () => getOrgEventsFn(),
});

export const Route = createFileRoute("/_protected/account/test-index")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(orgEventsQueryOptions());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data } = useSuspenseQuery(orgEventsQueryOptions());
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [timeRange, setTimeRange] = useState("24h");
    const [filters, setFilters] = useState<FilterState>({
        eventType: "all",
        productId: "all",
    });
    const {
        notifications,
        processEvent,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        soundEnabled,
        toggleSound,
        browserNotificationsEnabled,
        toggleBrowserNotifications,
        thresholds,
        updateThresholds,
    } = useNotifications();
    const eventsRef = useRef<AnalyticsEvent[]>([]);
    const { lastMessage, send } = useWebSocket();
    const { track } = usePulseMetrics();

    useEffect(() => {
        send(JSON.stringify({ type: "subscribe", tables: ["events"], filters: { id: data.organizationId } }));
    }, [data.organizationId]);

    // Keep ref in sync for notification processing
    useEffect(() => {
        eventsRef.current = events;
    }, [events]);

    useEffect(() => {
        setEvents(data.events);
    }, [processEvent, data]);

    useEffect(() => {
        if (lastMessage?.action == "INSERT" && lastMessage?.table == "events") {
            setEvents((prev) => {
                const updated = [lastMessage.data, ...prev.slice(0, 499)];
                processEvent(lastMessage.data, updated);
                return updated;
            });
        }
    }, [lastMessage]);

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

    const handleTest = (type: string) => {
        switch (type) {
            case "page_view":
                track(type, { page: "/account" });
                break;
            case "product_view":
                track(type, { product_id: "12", product_name: "Orange", price: 5000 });
                break;
            case "add_to_cart":
                track(type, { product_id: "12", product_name: "Orange", price: 5000, quantity: 2, cart_value: 10000 });
                break;
            case "checkout":
                track(type, { cart_value: 15000 });
                break;
            case "purchase":
                track(type, { order_value: 25000 });
                break;
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-event-purchase/5 rounded-full blur-3xl" />
            </div>

            <Header
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDismissNotification={dismissNotification}
                soundEnabled={soundEnabled}
                onToggleSound={toggleSound}
                browserNotificationsEnabled={browserNotificationsEnabled}
                onToggleBrowserNotifications={toggleBrowserNotifications}
                thresholds={thresholds}
                onThresholdsChange={updateThresholds}
            />

            <div className="border-b border-border bg-card/30">
                <div className="container mx-auto px-6">
                    <nav className="flex gap-1">
                        <Link
                            to="/account"
                            className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent"
                            activeProps={{ className: "text-primary border-primary" }}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/account/products"
                            className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent"
                            activeProps={{ className: "text-primary border-primary" }}
                        >
                            Products
                        </Link>
                    </nav>
                </div>
            </div>

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
                <div className="gap-4">
                    <Button variant="destructive" onClick={() => handleTest("page_view")}>
                        Page View
                    </Button>
                    <Button variant="destructive" onClick={() => handleTest("product_view")}>
                        Product View
                    </Button>
                    <Button variant="destructive" onClick={() => handleTest("add_to_cart")}>
                        Add To Cart
                    </Button>
                    <Button variant="destructive" onClick={() => handleTest("checkout")}>
                        Checkout
                    </Button>
                    <Button variant="destructive" onClick={() => handleTest("purchase")}>
                        Purchase
                    </Button>
                </div>
                <EventFeed events={filteredEvents} />
            </main>
        </div>
    );
}
