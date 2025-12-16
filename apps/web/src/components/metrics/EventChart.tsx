import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ChartDataPoint {
    hour: string;
    count: number;
    page_view?: number;
    product_view?: number;
    add_to_cart?: number;
    checkout?: number;
    purchase?: number;
}

interface EventChartProps {
    data: ChartDataPoint[];
    className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass rounded-lg p-3 border border-border">
                <p className="text-sm font-medium text-foreground mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-muted-foreground capitalize">{entry.dataKey.replace("_", " ")}:</span>
                        <span className="font-medium text-foreground">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function EventChart({ data, className }: EventChartProps) {
    return (
        <div className={cn("glass rounded-xl p-6", className)}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Event Activity</h3>
                    <p className="text-sm text-muted-foreground">Last 24 hours</p>
                </div>
                <div className="flex gap-3">
                    {[
                        { key: "page_view", color: "hsl(217, 91%, 60%)", label: "Page View" },
                        { key: "product_view", color: "hsl(187, 92%, 50%)", label: "Product View" },
                        { key: "add_to_cart", color: "hsl(43, 96%, 56%)", label: "Add to Cart" },
                        { key: "checkout", color: "hsl(271, 91%, 65%)", label: "Checkout" },
                        { key: "purchase", color: "hsl(142, 71%, 45%)", label: "Purchase" },
                    ].map((item) => (
                        <div key={item.key} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-muted-foreground hidden lg:inline">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPageView" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProductView" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(187, 92%, 50%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(187, 92%, 50%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAddToCart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCheckout" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(271, 91%, 65%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(271, 91%, 65%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" vertical={false} />
                    <XAxis
                        dataKey="hour"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="page_view" stackId="1" stroke="hsl(217, 91%, 60%)" fill="url(#colorPageView)" strokeWidth={2} />
                    <Area
                        type="monotone"
                        dataKey="product_view"
                        stackId="1"
                        stroke="hsl(187, 92%, 50%)"
                        fill="url(#colorProductView)"
                        strokeWidth={2}
                    />
                    <Area type="monotone" dataKey="add_to_cart" stackId="1" stroke="hsl(43, 96%, 56%)" fill="url(#colorAddToCart)" strokeWidth={2} />
                    <Area type="monotone" dataKey="checkout" stackId="1" stroke="hsl(271, 91%, 65%)" fill="url(#colorCheckout)" strokeWidth={2} />
                    <Area type="monotone" dataKey="purchase" stackId="1" stroke="hsl(142, 71%, 45%)" fill="url(#colorPurchase)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
