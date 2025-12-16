import { createFileRoute, Link } from "@tanstack/react-router";
import {
    Activity,
    FileText,
    Search,
    MessageSquare,
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Users,
    Package,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Target,
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState, useEffect, useRef, useMemo } from "react";
import { Header } from "@/components/metrics/Header";
import { MetricCard } from "@/components/metrics/MetricCard";
import { EventFeed } from "@/components/metrics/EventFeed";
import { EventChart } from "@/components/metrics/EventChart";
import { FunnelChart } from "@/components/metrics/FunnelChart";
import { TimeRangeSelector } from "@/components/metrics/TimeRangeSelector";
import { EventFilters, FilterState } from "@/components/metrics/EventFilters";
import { useNotifications } from "@/hooks/useNotifications";
import { generateEvents, generateRealtimeEvent, getHourlyData, calculateMetrics, AnalyticsEvent, EventType } from "@/lib/dummy-data";

export const Route = createFileRoute("/_protected/account/")({
    component: RouteComponent,
});

function RouteComponent() {
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [timeRange, setTimeRange] = useState("24h");
    const [filters, setFilters] = useState<FilterState>({
        eventType: "all",
        productId: "all",
        sessionId: "all",
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

    // Keep ref in sync for notification processing
    useEffect(() => {
        eventsRef.current = events;
    }, [events]);

    useEffect(() => {
        // Generate initial events
        setEvents(generateEvents(500, 24));

        // Simulate real-time events
        const interval = setInterval(() => {
            const newEvent = generateRealtimeEvent();
            setEvents((prev) => {
                const updated = [newEvent, ...prev.slice(0, 499)];
                // Process event for notifications
                processEvent(newEvent, updated);
                return updated;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [processEvent]);

    // Extract available products and sessions for filters
    const availableProducts = useMemo(() => {
        const productMap = new Map<string, string>();
        events.forEach((e) => {
            if (e.metadata.product_id && e.metadata.product_name) {
                productMap.set(e.metadata.product_id, e.metadata.product_name);
            }
        });
        return Array.from(productMap.entries()).map(([id, name]) => ({ id, name }));
    }, [events]);

    const availableSessions = useMemo(() => {
        const sessions = new Set<string>();
        events.forEach((e) => sessions.add(e.session_id));
        return Array.from(sessions);
    }, [events]);

    // Filter events based on current filters
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            if (filters.eventType !== "all" && event.event_type !== filters.eventType) {
                return false;
            }
            if (filters.productId !== "all" && event.metadata.product_id !== filters.productId) {
                return false;
            }
            if (filters.sessionId !== "all" && event.session_id !== filters.sessionId) {
                return false;
            }
            return true;
        });
    }, [events, filters]);

    const metrics = calculateMetrics(filteredEvents);
    const hourlyData = getHourlyData(filteredEvents);

    return (
        <div className="min-h-screen bg-background">
            {/* Ambient glow effect */}
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

            {/* Navigation */}
            <div className="border-b border-border bg-card/30">
                <div className="container mx-auto px-6">
                    <nav className="flex gap-1">
                        <Link
                            to="/"
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
                        <Link
                            to="/account/sessions"
                            className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent"
                            activeProps={{ className: "text-primary border-primary" }}
                        >
                            Sessions
                        </Link>
                    </nav>
                </div>
            </div>

            <main className="container mx-auto px-6 py-8 relative">
                {/* Top Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
                        <p className="text-muted-foreground">Monitor your store's performance in real-time</p>
                    </div>
                    <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <EventFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        availableProducts={availableProducts}
                        availableSessions={availableSessions}
                    />
                </div>

                {/* Metric Cards */}
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
                        value={`$${metrics.totalRevenue.toLocaleString()}`}
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
                        value={`$${metrics.avgOrderValue}`}
                        subtitle="Per purchase"
                        icon={TrendingUp}
                        trend={{ value: 5.4, isPositive: true }}
                        accentColor="purchase"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <EventChart data={hourlyData} className="lg:col-span-2" />
                    <FunnelChart data={metrics.counts} />
                </div>

                {/* Event Feed */}
                <EventFeed events={filteredEvents} />
            </main>
        </div>
    );
}
