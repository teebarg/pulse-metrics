import { cn } from "~/lib/utils";
import { EventType, formatEventType } from "~/lib/dummy-data";

interface FunnelChartProps {
    data: Record<EventType, number>;
    className?: string;
}

const funnelOrder: EventType[] = ["page_view", "product_view", "add_to_cart", "checkout", "purchase"];

const funnelColors = {
    page_view: "from-event-page-view/80 to-event-page-view/40",
    product_view: "from-event-product-view/80 to-event-product-view/40",
    add_to_cart: "from-event-add-to-cart/80 to-event-add-to-cart/40",
    checkout: "from-event-checkout/80 to-event-checkout/40",
    purchase: "from-event-purchase/80 to-event-purchase/40",
};

export function FunnelChart({ data, className }: FunnelChartProps) {
    const maxValue = Math.max(...Object.values(data));

    return (
        <div className={cn("glass rounded-xl p-6", className)}>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Conversion Funnel</h3>
                <p className="text-sm text-muted-foreground">User journey breakdown</p>
            </div>

            <div className="space-y-3">
                {funnelOrder.map((eventType, index) => {
                    const count = data[eventType] || 0;
                    const percentage = maxValue ? (count / maxValue) * 100 : 0;
                    const conversionRate =
                        index > 0 && data[funnelOrder[index - 1]] ? ((count / data[funnelOrder[index - 1]]) * 100).toFixed(1) : null;

                    return (
                        <div key={eventType} className="group">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium text-foreground">{formatEventType(eventType)}</span>
                                <div className="flex items-center gap-3">
                                    {conversionRate && <span className="text-xs text-muted-foreground">{conversionRate}% →</span>}
                                    <span className="text-sm font-bold text-foreground tabular-nums">{count.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="h-8 bg-secondary rounded-lg overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full bg-linear-to-r rounded-lg transition-all duration-500 group-hover:opacity-90",
                                        funnelColors[eventType]
                                    )}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
