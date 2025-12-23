import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnalyticsEvent, getProductAnalytics } from "@/lib/dummy-data";
import { TrendingUp, Eye, ShoppingCart, Package, DollarSign, ChevronRight } from "lucide-react";
import { currency } from "~/lib/utils";
import { getOrgEventsFn } from "~/server-fn/event.fn";
import { useQuery } from "@tanstack/react-query";

const orgEventsQueryOptions = () => ({
    queryKey: ["organization", "events"],
    queryFn: () => getOrgEventsFn(),
});

export const Route = createFileRoute("/_protected/account/_metricsLayout/products")({
    component: RouteComponent,
});

function RouteComponent() {
    const { data, isLoading } = useQuery(orgEventsQueryOptions());
    const [events, setEvents] = useState<AnalyticsEvent[]>();

    const productAnalytics = useMemo(() => getProductAnalytics(events), [events]);

    const topProduct = productAnalytics[0];
    const totalRevenue = productAnalytics.reduce((sum, p) => sum + p.revenue, 0);
    const totalViews = productAnalytics.reduce((sum, p) => sum + p.views, 0);
    const avgConversion =
        productAnalytics.length > 0 ? (productAnalytics.reduce((sum, p) => sum + p.conversionRate, 0) / productAnalytics.length).toFixed(1) : "0.0";

    useEffect(() => {
        setEvents(data.events);
    }, [data]);

    return (
        <main className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-card/50 border-border backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Products</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{productAnalytics.length}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Package className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-border backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Views</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{totalViews.toLocaleString()}</p>
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
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{currency(totalRevenue)}</p>
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
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Conversion</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{avgConversion}%</p>
                            </div>
                            <div className="p-3 rounded-xl bg-event-checkout/10">
                                <TrendingUp className="h-5 w-5 text-event-checkout" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performer Highlight */}
            {topProduct && (
                <Card className="bg-linear-to-r from-primary/10 via-card/50 to-card/50 border-primary/20 mb-8">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-primary/20">
                                <TrendingUp className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-primary uppercase tracking-wider font-medium">Top Performer</p>
                                <p className="text-xl font-bold text-foreground mt-1">{topProduct.name}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm text-muted-foreground">
                                        <span className="text-foreground font-medium">{topProduct.views}</span> views
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        <span className="text-foreground font-medium">{topProduct.purchases}</span> purchases
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        <span className="text-event-purchase font-medium">{currency(topProduct.revenue)}</span> revenue
                                    </span>
                                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                                        {topProduct.conversionRate.toFixed(1)}% conversion
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Products Table */}
            <Card className="bg-card/50 border-border backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-foreground">Product Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="text-muted-foreground">Product</TableHead>
                                <TableHead className="text-muted-foreground text-right">Views</TableHead>
                                <TableHead className="text-muted-foreground text-right">Add to Cart</TableHead>
                                <TableHead className="text-muted-foreground text-right">Purchases</TableHead>
                                <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
                                <TableHead className="text-muted-foreground">Conversion Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productAnalytics.map((product, index) => (
                                <TableRow key={product.id} className="border-border hover:bg-muted/30 cursor-pointer group">
                                    <TableCell>
                                        <Link
                                            to="/account/product/$slug"
                                            params={{
                                                slug: product.id,
                                            }}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="text-xs text-muted-foreground w-5">#{index + 1}</span>
                                            <div className="flex-1">
                                                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{currency(product.price)}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Eye className="h-3 w-3 text-event-product-view" />
                                            <span className="text-foreground">{product.views}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <ShoppingCart className="h-3 w-3 text-event-add-to-cart" />
                                            <span className="text-foreground">{product.addToCart}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Package className="h-3 w-3 text-event-purchase" />
                                            <span className="text-foreground">{product.purchases}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-event-purchase font-medium">{currency(product.revenue)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Progress value={product.conversionRate} className="h-2 w-20 bg-muted" />
                                            <span
                                                className={`text-sm font-medium ${
                                                    product.conversionRate >= 10
                                                        ? "text-event-purchase"
                                                        : product.conversionRate >= 5
                                                          ? "text-event-add-to-cart"
                                                          : "text-muted-foreground"
                                                }`}
                                            >
                                                {product.conversionRate.toFixed(1)}%
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
