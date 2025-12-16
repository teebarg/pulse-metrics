import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/metrics/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
    generateEvents,
    AnalyticsEvent,
    getSessionsFromEvents,
    getSessionAnalytics,
    formatDuration,
    formatEventType,
    getEventColor,
    SessionData,
} from "@/lib/dummy-data";
import { useNotifications } from "@/hooks/useNotifications";
import {
    Users,
    Clock,
    TrendingUp,
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    Search,
    Share2,
    DollarSign,
    MousePointerClick,
    ShoppingCart,
    CheckCircle2,
    XCircle,
    ChevronRight,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const deviceIcons = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
};

const sourceIcons = {
    direct: Globe,
    organic: Search,
    social: Share2,
    paid: DollarSign,
    referral: MousePointerClick,
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export const Route = createFileRoute("/_protected/account/sessions")({
    component: RouteComponent,
});

function RouteComponent() {
    const [events] = useState<AnalyticsEvent[]>(() => generateEvents(500, 24));
    const {
        notifications,
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

    const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);

    const sessions = useMemo(() => getSessionsFromEvents(events), [events]);
    const analytics = useMemo(() => getSessionAnalytics(sessions), [sessions]);

    const deviceData = useMemo(
        () => [
            { name: "Desktop", value: analytics.deviceBreakdown.desktop },
            { name: "Mobile", value: analytics.deviceBreakdown.mobile },
            { name: "Tablet", value: analytics.deviceBreakdown.tablet },
        ],
        [analytics]
    );

    const sourceData = useMemo(
        () => [
            { name: "Organic", value: analytics.sourceBreakdown.organic },
            { name: "Direct", value: analytics.sourceBreakdown.direct },
            { name: "Social", value: analytics.sourceBreakdown.social },
            { name: "Paid", value: analytics.sourceBreakdown.paid },
            { name: "Referral", value: analytics.sourceBreakdown.referral },
        ],
        [analytics]
    );

    return (
        <div className="min-h-screen bg-background">
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

            <main className="container mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">User Sessions</h2>
                    <p className="text-muted-foreground">Analyze individual session journeys and behavior patterns</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-card/50 backdrop-blur border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                                    <p className="text-2xl font-bold text-foreground">{analytics.totalSessions}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Avg Duration</p>
                                    <p className="text-2xl font-bold text-foreground">{formatDuration(Math.round(analytics.avgDuration))}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-chart-2/10">
                                    <Clock className="h-6 w-6 text-chart-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                                    <p className="text-2xl font-bold text-foreground">{analytics.conversionRate.toFixed(1)}%</p>
                                </div>
                                <div className="p-3 rounded-xl bg-event-purchase/10">
                                    <TrendingUp className="h-6 w-6 text-event-purchase" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur border-border">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Bounce Rate</p>
                                    <p className="text-2xl font-bold text-foreground">{analytics.bounceRate.toFixed(1)}%</p>
                                </div>
                                <div className="p-3 rounded-xl bg-destructive/10">
                                    <XCircle className="h-6 w-6 text-destructive" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Device Breakdown */}
                    <Card className="bg-card/50 backdrop-blur border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Device Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-8">
                                <div className="w-40 h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={deviceData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={70}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {deviceData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex-1 space-y-3">
                                    {deviceData.map((item, index) => {
                                        const Icon = deviceIcons[item.name.toLowerCase() as keyof typeof deviceIcons];
                                        const percentage =
                                            analytics.totalSessions > 0 ? ((item.value / analytics.totalSessions) * 100).toFixed(1) : "0";
                                        return (
                                            <div key={item.name} className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-foreground flex-1">{item.name}</span>
                                                <span className="text-sm font-medium text-foreground">{percentage}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Traffic Sources */}
                    <Card className="bg-card/50 backdrop-blur border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Traffic Sources</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {sourceData.map((item) => {
                                    const Icon = sourceIcons[item.name.toLowerCase() as keyof typeof sourceIcons];
                                    const percentage = analytics.totalSessions > 0 ? (item.value / analytics.totalSessions) * 100 : 0;
                                    return (
                                        <div key={item.name} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm text-foreground">{item.name}</span>
                                                </div>
                                                <span className="text-sm font-medium text-foreground">
                                                    {item.value} ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <Progress value={percentage} className="h-2" />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sessions List with Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sessions List */}
                    <Card className="bg-card/50 backdrop-blur border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">Recent Sessions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[500px]">
                                <div className="divide-y divide-border">
                                    {sessions.slice(0, 50).map((session) => {
                                        const DeviceIcon = deviceIcons[session.device];
                                        return (
                                            <button
                                                key={session.id}
                                                onClick={() => setSelectedSession(session)}
                                                className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                                                    selectedSession?.id === session.id ? "bg-muted/50" : ""
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                                                            {session.id.slice(0, 12)}...
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {session.didPurchase ? (
                                                            <Badge
                                                                variant="default"
                                                                className="bg-event-purchase/20 text-event-purchase border-event-purchase/30"
                                                            >
                                                                Converted
                                                            </Badge>
                                                        ) : session.didAddToCart ? (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-event-add-to-cart/20 text-event-add-to-cart border-event-add-to-cart/30"
                                                            >
                                                                Cart
                                                            </Badge>
                                                        ) : null}
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>{session.events.length} events</span>
                                                    <span>{formatDuration(session.duration)}</span>
                                                    {session.revenue > 0 && (
                                                        <span className="text-event-purchase">${session.revenue.toFixed(2)}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">{session.startTime.toLocaleString()}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Session Detail */}
                    <Card className="bg-card/50 backdrop-blur border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground">{selectedSession ? "Session Journey" : "Select a Session"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedSession ? (
                                <div className="space-y-6">
                                    {/* Session Summary */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-1">Duration</p>
                                            <p className="text-sm font-medium text-foreground">{formatDuration(selectedSession.duration)}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-1">Events</p>
                                            <p className="text-sm font-medium text-foreground">{selectedSession.events.length}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-1">Device</p>
                                            <p className="text-sm font-medium text-foreground capitalize">{selectedSession.device}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-muted/50">
                                            <p className="text-xs text-muted-foreground mb-1">Source</p>
                                            <p className="text-sm font-medium text-foreground capitalize">{selectedSession.source}</p>
                                        </div>
                                    </div>

                                    {/* Conversion Status */}
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                                        {selectedSession.didPurchase ? (
                                            <>
                                                <CheckCircle2 className="h-8 w-8 text-event-purchase" />
                                                <div>
                                                    <p className="font-medium text-foreground">Converted</p>
                                                    <p className="text-sm text-muted-foreground">Revenue: ${selectedSession.revenue.toFixed(2)}</p>
                                                </div>
                                            </>
                                        ) : selectedSession.didAddToCart ? (
                                            <>
                                                <ShoppingCart className="h-8 w-8 text-event-add-to-cart" />
                                                <div>
                                                    <p className="font-medium text-foreground">Added to Cart</p>
                                                    <p className="text-sm text-muted-foreground">Did not complete purchase</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-8 w-8 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium text-foreground">Browsing Only</p>
                                                    <p className="text-sm text-muted-foreground">No conversion</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Event Timeline */}
                                    <div>
                                        <h4 className="text-sm font-medium text-foreground mb-3">Event Timeline</h4>
                                        <ScrollArea className="h-[250px]">
                                            <div className="space-y-0">
                                                {selectedSession.events.map((event, index) => (
                                                    <div key={event.id} className="flex gap-3">
                                                        {/* Timeline line */}
                                                        <div className="flex flex-col items-center">
                                                            <div className={`w-3 h-3 rounded-full bg-${getEventColor(event.event_type)}`} />
                                                            {index < selectedSession.events.length - 1 && (
                                                                <div className="w-0.5 h-full bg-border flex-1 min-h-[40px]" />
                                                            )}
                                                        </div>
                                                        {/* Event content */}
                                                        <div className="pb-4 flex-1">
                                                            <p className="text-sm font-medium text-foreground">{formatEventType(event.event_type)}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {event.metadata.page ||
                                                                    event.metadata.product_name ||
                                                                    (event.metadata.order_value ? `$${event.metadata.order_value}` : "")}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">{event.timestamp.toLocaleTimeString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                                    <Users className="h-12 w-12 mb-4 opacity-50" />
                                    <p>Click on a session to view its journey</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
