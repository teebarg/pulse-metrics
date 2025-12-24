export type EventType = "page_view" | "product_view" | "add_to_cart" | "checkout" | "purchase";

export interface AnalyticsEvent {
    id: string;
    eventType: EventType;
    timestamp: Date;
    sessionId: string;
    metadata: {
        page?: string;
        product_id?: string;
        product_name?: string;
        price?: number;
        quantity?: number;
        cart_value?: number;
        order_value?: number;
    };
}

export function getProductHourlyData(events: AnalyticsEvent[]) {
    const hourlyMap = new Map<string, { views: number; addToCart: number; purchases: number }>();

    for (let i = 23; i >= 0; i--) {
        const hour = new Date();
        hour.setHours(hour.getHours() - i, 0, 0, 0);
        const key = hour.toLocaleTimeString("en-US", { hour: "2-digit", hour12: true });
        hourlyMap.set(key, { views: 0, addToCart: 0, purchases: 0 });
    }

    events.forEach((event) => {
        const hour = new Date(event.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            hour12: true,
        });

        if (hourlyMap.has(hour)) {
            const data = hourlyMap.get(hour)!;
            if (event.eventType === "product_view") data.views++;
            if (event.eventType === "add_to_cart") data.addToCart++;
            if (event.eventType === "purchase") data.purchases++;
        }
    });

    return Array.from(hourlyMap.entries()).map(([hour, data]) => ({
        hour,
        ...data,
    }));
}

export function getEventColor(eventType: EventType): string {
    const colors: Record<EventType, string> = {
        page_view: "event-page-view",
        product_view: "event-product-view",
        add_to_cart: "event-add-to-cart",
        checkout: "event-checkout",
        purchase: "event-purchase",
    };
    return colors[eventType];
}

export function getEventBgColor(eventType: EventType): string {
    const colors: Record<EventType, string> = {
        page_view: "bg-event-page-view",
        product_view: "bg-event-product-view",
        add_to_cart: "bg-event-add-to-cart",
        checkout: "bg-event-checkout",
        purchase: "bg-event-purchase",
    };
    return colors[eventType];
}

export function formatEventType(eventType: EventType): string {
    return eventType
        ?.split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function getHourlyData(events: AnalyticsEvent[]) {
    const hourlyMap = new Map<
        string,
        { count: number; page_view: number; product_view: number; add_to_cart: number; checkout: number; purchase: number }
    >();

    for (let i = 23; i >= 0; i--) {
        const hour = new Date();
        hour.setHours(hour.getHours() - i, 0, 0, 0);
        const key = hour.toLocaleTimeString("en-US", { hour: "2-digit", hour12: true });
        hourlyMap.set(key, {
            count: 0,
            page_view: 0,
            product_view: 0,
            add_to_cart: 0,
            checkout: 0,
            purchase: 0,
        });
    }

    events.forEach((event) => {
        const hour = new Date(event.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            hour12: true,
        });
        if (hourlyMap.has(hour)) {
            const data = hourlyMap.get(hour)!;
            data.count++;
            data[event.eventType]++;
        }
    });

    return Array.from(hourlyMap.entries()).map(([hour, data]) => ({
        hour,
        ...data,
    }));
}

export function getEventTypeCounts(events: AnalyticsEvent[]): Record<EventType, number> {
    return events.reduce(
        (acc, event) => {
            acc[event.eventType] = (acc[event.eventType] || 0) + 1;
            return acc;
        },
        {} as Record<EventType, number>
    );
}

export function calculateMetrics(events: AnalyticsEvent[]) {
    const counts = getEventTypeCounts(events);
    const totalRevenue = events.filter((e) => e.eventType === "purchase").reduce((sum, e) => sum + (e.metadata.order_value || 0), 0);

    const conversionRate = counts.purchase && counts.page_view ? ((counts.purchase / counts.page_view) * 100).toFixed(2) : "0.00";

    const cartToCheckout = counts.checkout && counts.add_to_cart ? ((counts.checkout / counts.add_to_cart) * 100).toFixed(1) : "0.0";

    const avgOrderValue = counts.purchase ? (totalRevenue / counts.purchase).toFixed(2) : "0.00";

    return {
        totalEvents: events.length,
        totalRevenue,
        conversionRate,
        cartToCheckout,
        avgOrderValue,
        counts,
    };
}

export interface ProductAnalytics {
    id: string;
    name: string;
    price: number;
    views: number;
    addToCart: number;
    purchases: number;
    revenue: number;
    conversionRate: number;
}

export function getProductAnalytics(events: AnalyticsEvent[] | undefined): ProductAnalytics[] {
    if (!events) return [];

    const productMap = new Map<string, ProductAnalytics>();
    events?.forEach((e) => {
        if (e.metadata.product_id && e.metadata.product_name) {
            productMap.set(e.metadata.product_id, {
                id: e.metadata.product_id,
                name: e.metadata.product_name,
                price: e.metadata.price || 0,
                views: 0,
                addToCart: 0,
                purchases: 0,
                revenue: 0,
                conversionRate: 0,
            });
        }
    });

    events.forEach((event) => {
        const productId = event.metadata.product_id;
        if (!productId || !productMap.has(productId)) return;

        const product = productMap.get(productId)!;

        switch (event.eventType) {
            case "product_view":
                product.views++;
                break;
            case "add_to_cart":
                product.addToCart++;
                break;
            case "purchase":
                product.purchases++;
                product.revenue += event.metadata.order_value || product.price;
                break;
        }
    });

    // Calculate conversion rates and sort by revenue
    const analytics = Array.from(productMap.values()).map((product) => ({
        ...product,
        conversionRate: product.views > 0 ? (product.purchases / product.views) * 100 : 0,
    }));

    return analytics.sort((a, b) => b.revenue - a.revenue);
}
