import { Filter, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { EventType, formatEventType, getEventBgColor } from "~/lib/dummy-data";
import { cn } from "~/lib/utils";

export interface FilterState {
    eventType: EventType | "all";
    productId: string;
}

interface EventFiltersProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    availableProducts: { id: string; name: string }[];
}

const eventTypes: (EventType | "all")[] = ["all", "page_view", "product_view", "add_to_cart", "checkout", "purchase"];

export function EventFilters({ filters, onFiltersChange, availableProducts }: EventFiltersProps) {
    const hasActiveFilters = filters.eventType !== "all" || filters.productId !== "all";

    const clearFilters = () => {
        onFiltersChange({ eventType: "all", productId: "all" });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
            </div>

            <Select value={filters.eventType} onValueChange={(value) => onFiltersChange({ ...filters, eventType: value as EventType | "all" })}>
                <SelectTrigger className="w-[160px] bg-background border-border">
                    <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                    {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                                {type !== "all" && <span className={cn("h-2 w-2 rounded-full", getEventBgColor(type as EventType))} />}
                                <span>{type === "all" ? "All Events" : formatEventType(type as EventType)}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filters.productId} onValueChange={(value) => onFiltersChange({ ...filters, productId: value })}>
                <SelectTrigger className="w-[180px] bg-background border-border">
                    <SelectValue placeholder="Product" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                    <SelectItem value="all">All Products</SelectItem>
                    {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                            {product.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}

            {hasActiveFilters && (
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-muted-foreground">Active:</span>
                    {filters.eventType !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                            {formatEventType(filters.eventType as EventType)}
                        </Badge>
                    )}
                    {filters.productId !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                            {availableProducts.find((p) => p.id === filters.productId)?.name || filters.productId}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
