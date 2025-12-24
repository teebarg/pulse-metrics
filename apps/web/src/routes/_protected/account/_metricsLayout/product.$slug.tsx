import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getEventColor, formatEventType, getProductHourlyData } from "@/lib/dummy-data";
import { ArrowLeft, Eye, ShoppingCart, Package, DollarSign, TrendingUp, Clock } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { currency, formatDate } from "~/lib/utils";
import { useStore } from "@tanstack/react-store";
import { store } from "~/utils/store";

const chartConfig = {
    views: { label: "Views", color: "hsl(var(--event-product-view))" },
    addToCart: { label: "Add to Cart", color: "hsl(var(--event-add-to-cart))" },
    purchases: { label: "Purchases", color: "hsl(var(--event-purchase))" },
};

export const Route = createFileRoute("/_protected/account/_metricsLayout/product/$slug")({
    component: RouteComponent,
});

function RouteComponent() {
    const { slug: productId } = Route.useParams();
    const events = useStore(store, (state) => state.events);

    const availableProducts = useMemo(() => {
        const productMap = new Map<string, any>();
        events?.forEach((e) => {
            if (e.metadata.product_id && e.metadata.product_name) {
                productMap.set(e.metadata.product_id, { name: e.metadata.product_name, price: e.metadata.price });
            }
        });
        return Array.from(productMap.entries()).map(([id, { name, price }]) => ({ id, name, price }));
    }, [events]);

    const product = useMemo(() => availableProducts.find((p) => p.id == productId), [productId, availableProducts]);

    const productEvents = useMemo(() => {
        return events?.filter((e) => e.metadata.product_id === productId);
    }, [events, productId]);

    const stats = useMemo(() => {
        const views = productEvents?.filter((e) => e.eventType === "product_view").length || 0;
        const addToCart = productEvents?.filter((e) => e.eventType === "add_to_cart").length || 0;
        const purchases = productEvents?.filter((e) => e.eventType === "purchase").length || 0;
        const revenue = purchases * (product?.price || 0);
        const conversionRate = views > 0 ? (purchases / views) * 100 : 0;
        const cartRate = views > 0 ? (addToCart / views) * 100 : 0;

        return { views, addToCart, purchases, revenue, conversionRate, cartRate };
    }, [productEvents, product]);

    const hourlyData = useMemo(() => getProductHourlyData(productEvents || []), [productEvents]);

    const recentEvents = useMemo(() => productEvents?.slice(0, 20), [productEvents]);

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
                    <p className="text-muted-foreground mb-4">The product you"re looking for doesn"t exist.</p>
                    <Link to="/account/products">
                        <Button variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Products
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <Link to="/account/products">
                    <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Button>
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {currency(product.price)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">ID: {product.id}</span>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className={`text-sm ${stats.conversionRate >= 10 ? `border-event-purchase text-event-purchase` : `border-border`}`}
                    >
                        {stats.conversionRate.toFixed(1)}% conversion
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <Card className="bg-card/50 border-border backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Views</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stats.views}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-event-product-view/10">
                                <Eye className="h-5 w-5 text-event-product-view" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Add to Cart</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stats.addToCart}</p>
                                <p className="text-xs text-muted-foreground mt-1">{stats.cartRate.toFixed(1)}% of views</p>
                            </div>
                            <div className="p-3 rounded-xl bg-event-add-to-cart/10">
                                <ShoppingCart className="h-5 w-5 text-event-add-to-cart" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Purchases</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stats.purchases}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-event-purchase/10">
                                <Package className="h-5 w-5 text-event-purchase" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</p>
                                <p className="text-2xl font-bold text-event-purchase mt-1">{currency(stats.revenue)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-event-purchase/10">
                                <DollarSign className="h-5 w-5 text-event-purchase" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Conversion</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stats.conversionRate.toFixed(1)}%</p>
                            </div>
                            <div className="p-3 rounded-xl bg-primary/10">
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Events */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trends Chart */}
                <Card className="bg-card/50 border-border backdrop-blur-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-foreground">24-Hour Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--event-product-view))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--event-product-view))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="cartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--event-add-to-cart))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--event-add-to-cart))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--event-purchase))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--event-purchase))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="hour"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    stroke="hsl(var(--event-product-view))"
                                    fill="url(#viewsGradient)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="addToCart"
                                    stroke="hsl(var(--event-add-to-cart))"
                                    fill="url(#cartGradient)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="purchases"
                                    stroke="hsl(var(--event-purchase))"
                                    fill="url(#purchaseGradient)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Recent Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-3">
                                {recentEvents?.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">No events for this product</p>
                                ) : (
                                    recentEvents?.map((event, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
                                            <div className={`w-2 h-2 rounded-full bg-${getEventColor(event.eventType)}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground">{formatEventType(event.eventType)}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {formatDate(event.timestamp as unknown as string)}
                                                </p>
                                            </div>
                                            {event.eventType === "add_to_cart" && event.metadata.quantity && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Qty: {event.metadata.quantity}
                                                </Badge>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
