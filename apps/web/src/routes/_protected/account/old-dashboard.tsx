import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, DollarSign, ShoppingCart, TrendingUp, Users, Package, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_protected/account/old-dashboard")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate({ from: "/account" });
    const [isRefreshing] = useState(false);

    const realtimeMetrics = {
        active_visitors: 0,
        recent_purchases: 0,
        recent_revenue: 0,
    };
    const todayMetrics = {
        unique_visitors: 0,
        total_revenue: 0,
        total_purchases: 0,
        conversion_rate: 0,
    };
    const hourlyData: any = [];
    const topProducts: any = [];
    const recentEvents: any = [];
    const fetchAllData = () => {
        // TODO fetch all data
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <p className="text-sm text-slate-400 mt-1">Real-time analytics for your store</p>
                        </div>
                        <button
                            onClick={fetchAllData}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Real-time Metrics Banner */}
                <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 animate-pulse" />
                            <span className="font-semibold">Live Now</span>
                        </div>
                        <span className="text-sm opacity-90">Updates every 5 seconds</span>
                    </div>

                    {realtimeMetrics && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-4xl font-bold mb-1">{realtimeMetrics.active_visitors}</div>
                                <div className="text-sm opacity-90">Active Visitors</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-1">{realtimeMetrics.recent_purchases}</div>
                                <div className="text-sm opacity-90">Recent Purchases (5 min)</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-1">${realtimeMetrics.recent_revenue}</div>
                                <div className="text-sm opacity-90">Recent Revenue (5 min)</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Today's Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Unique Visitors"
                        value={todayMetrics?.unique_visitors || 0}
                        change="+12.5%"
                        positive
                        icon={<Users className="w-5 h-5" />}
                        subtitle="Today"
                    />
                    <MetricCard
                        title="Total Revenue"
                        value={`$${todayMetrics?.total_revenue || 0}`}
                        change="+23.1%"
                        positive
                        icon={<DollarSign className="w-5 h-5" />}
                        subtitle="Today"
                    />
                    <MetricCard
                        title="Total Purchases"
                        value={todayMetrics?.total_purchases || 0}
                        change="+8.2%"
                        positive
                        icon={<ShoppingCart className="w-5 h-5" />}
                        subtitle="Today"
                    />
                    <MetricCard
                        title="Conversion Rate"
                        value={`${todayMetrics?.conversion_rate || 0}%`}
                        change="+0.3%"
                        positive
                        icon={<TrendingUp className="w-5 h-5" />}
                        subtitle="Today"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Visitors Chart */}
                    <ChartCard title="Visitor Activity" subtitle="Last 24 hours">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={hourlyData}>
                                <defs>
                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "1px solid #334155",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Area type="monotone" dataKey="visitors" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisitors)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Revenue Chart */}
                    <ChartCard title="Revenue Trend" subtitle="Last 24 hours">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "1px solid #334155",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* Top Products & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-400" />
                                    Top Products
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">Most viewed this week</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {topProducts.map((product: any, index: number) => (
                                <div
                                    key={product.product_id}
                                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-slate-300">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{product.product_name}</div>
                                            <div className="text-sm text-slate-400">{product.count} views</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-green-400">${product.revenue}</div>
                                        <div className="text-xs text-slate-400">revenue</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-purple-400" />
                                    Recent Activity
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">Live event stream</p>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {recentEvents.map((event: any) => (
                                <div key={event.id} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition">
                                    <EventIcon type={event.event_type} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{formatEventType(event.event_type)}</div>
                                        <div className="text-xs text-slate-400 truncate">
                                            {event.properties.page}
                                            {event.properties.product_name && ` • ${event.properties.product_name}`}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 whitespace-nowrap">{formatTimeAgo(event.timestamp)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    change,
    positive,
    icon,
    subtitle,
}: {
    title: string;
    value: number | string;
    change: any;
    positive: boolean;
    icon: React.ReactNode;
    subtitle?: string;
}) {
    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-slate-700/50 rounded-lg">{icon}</div>
                {change && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${positive ? "text-green-400" : "text-red-400"}`}>
                        {positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {change}
                    </div>
                )}
            </div>
            <div className="text-3xl font-bold mb-1">{value}</div>
            <div className="text-sm text-slate-400">{title}</div>
            {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
        </div>
    );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold">{title}</h3>
                {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

function EventIcon({ type }: { type: "page_view" | "product_view" | "add_to_cart" | "checkout" | "purchase" }) {
    const icons = {
        page_view: <Activity className="w-4 h-4 text-blue-400" />,
        product_view: <Package className="w-4 h-4 text-purple-400" />,
        add_to_cart: <ShoppingCart className="w-4 h-4 text-yellow-400" />,
        checkout: <DollarSign className="w-4 h-4 text-orange-400" />,
        purchase: <TrendingUp className="w-4 h-4 text-green-400" />,
    };

    return <div className="p-2 bg-slate-800 rounded-lg">{icons[type] || <Activity className="w-4 h-4 text-slate-400" />}</div>;
}

function formatEventType(type: string) {
    return type
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatTimeAgo(timestamp: string) {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}
