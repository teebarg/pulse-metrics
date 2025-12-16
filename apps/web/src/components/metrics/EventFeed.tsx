import { cn } from "@/lib/utils";
import { AnalyticsEvent, formatEventType, getEventColor, getEventBgColor } from "@/lib/dummy-data";
import { Eye, ShoppingCart, CreditCard, Package, MousePointer } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventFeedProps {
    events: AnalyticsEvent[];
    className?: string;
}

const eventIcons = {
    page_view: MousePointer,
    product_view: Eye,
    add_to_cart: ShoppingCart,
    checkout: CreditCard,
    purchase: Package,
};

export function EventFeed({ events, className }: EventFeedProps) {
    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className={cn("glass rounded-xl p-6", className)}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Live Event Feed</h3>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-event-purchase opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-event-purchase"></span>
                    </span>
                    <span className="text-xs text-muted-foreground">Live</span>
                </div>
            </div>

            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                    {events.slice(0, 20).map((event, index) => {
                        const Icon = eventIcons[event.event_type];
                        const colorClass = getEventColor(event.event_type);
                        const bgColorClass = getEventBgColor(event.event_type);

                        return (
                            <div
                                key={event.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className={cn("p-2 rounded-lg", bgColorClass, "bg-opacity-20")}>
                                    <Icon className={cn("h-4 w-4", colorClass)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={cn("text-sm font-medium", colorClass)}>{formatEventType(event.event_type)}</p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(event.timestamp)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                        {event.metadata.product_name ||
                                            event.metadata.page ||
                                            `$${event.metadata.order_value || event.metadata.cart_value || ""}`}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
