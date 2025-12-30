import { cn } from "~/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    accentColor?: string;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, className, accentColor = "primary" }: MetricCardProps) {
    return (
        <div className={cn("glass rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] animate-fade-in", className)}>
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                    {trend && (
                        <div
                            className={cn(
                                "flex items-center gap-1 text-xs font-medium",
                                trend.isPositive ? "text-event-purchase" : "text-destructive"
                            )}
                        >
                            <span>{trend.isPositive ? "↑" : "↓"}</span>
                            <span>{Math.abs(trend.value)}% from last hour</span>
                        </div>
                    )}
                </div>
                <div
                    className={cn(
                        "p-3 rounded-lg bg-secondary",
                        accentColor === "primary" && "text-primary",
                        accentColor === "purchase" && "text-event-purchase",
                        accentColor === "checkout" && "text-event-checkout",
                        accentColor === "cart" && "text-event-add-to-cart"
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
