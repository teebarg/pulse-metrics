export type EventType = "page_view" | "product_view" | "add_to_cart" | "checkout" | "purchase";

export interface AnalyticsEvent {
    id: string;
    event_type: EventType;
    timestamp: Date;
    user_id: string;
    session_id: string;
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

export const products = [
    { id: "prod_001", name: "Wireless Headphones", price: 149.99 },
    { id: "prod_002", name: "Smart Watch Pro", price: 299.99 },
    { id: "prod_003", name: "Premium Backpack", price: 89.99 },
    { id: "prod_004", name: "Running Shoes", price: 129.99 },
    { id: "prod_005", name: "Laptop Stand", price: 59.99 },
    { id: "prod_006", name: "Mechanical Keyboard", price: 179.99 },
    { id: "prod_007", name: "USB-C Hub", price: 49.99 },
    { id: "prod_008", name: "Desk Lamp", price: 39.99 },
];

const pages = ["/home", "/products", "/about", "/contact", "/blog", "/cart", "/checkout"];

export function getProductById(productId: string) {
    return products.find((p) => p.id === productId);
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
        const hour = event.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", hour12: true });
        if (hourlyMap.has(hour)) {
            const data = hourlyMap.get(hour)!;
            if (event.event_type === "product_view") data.views++;
            if (event.event_type === "add_to_cart") data.addToCart++;
            if (event.event_type === "purchase") data.purchases++;
        }
    });

    return Array.from(hourlyMap.entries()).map(([hour, data]) => ({
        hour,
        ...data,
    }));
}

function randomId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}

function randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateEvent(timestamp: Date): AnalyticsEvent {
    const eventTypes: EventType[] = ["page_view", "product_view", "add_to_cart", "checkout", "purchase"];
    const weights = [0.4, 0.25, 0.18, 0.1, 0.07];

    let random = Math.random();
    let eventType: EventType = "page_view";

    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            eventType = eventTypes[i];
            break;
        }
    }

    const product = randomFrom(products);
    const baseEvent = {
        id: randomId("evt"),
        event_type: eventType,
        timestamp,
        user_id: randomId("usr"),
        session_id: randomId("ses"),
    };

    switch (eventType) {
        case "page_view":
            return { ...baseEvent, metadata: { page: randomFrom(pages) } };
        case "product_view":
            return { ...baseEvent, metadata: { product_id: product.id, product_name: product.name, price: product.price } };
        case "add_to_cart":
            const quantity = Math.floor(Math.random() * 3) + 1;
            return {
                ...baseEvent,
                metadata: {
                    product_id: product.id,
                    product_name: product.name,
                    price: product.price,
                    quantity,
                    cart_value: product.price * quantity,
                },
            };
        case "checkout":
            return {
                ...baseEvent,
                metadata: { cart_value: Math.floor(Math.random() * 400) + 50 },
            };
        case "purchase":
            return {
                ...baseEvent,
                metadata: { order_value: Math.floor(Math.random() * 500) + 100 },
            };
        default:
            return { ...baseEvent, metadata: {} };
    }
}

export function generateEvents(count: number, hoursBack: number = 24): AnalyticsEvent[] {
    const events: AnalyticsEvent[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const timestamp = new Date(now.getTime() - Math.random() * hoursBack * 60 * 60 * 1000);
        events.push(generateEvent(timestamp));
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateRealtimeEvent(): AnalyticsEvent {
    return generateEvent(new Date());
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
        .split("_")
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
        const hour = event.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", hour12: true });
        if (hourlyMap.has(hour)) {
            const data = hourlyMap.get(hour)!;
            data.count++;
            data[event.event_type]++;
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
            acc[event.event_type] = (acc[event.event_type] || 0) + 1;
            return acc;
        },
        {} as Record<EventType, number>
    );
}

export function calculateMetrics(events: AnalyticsEvent[]) {
    const counts = getEventTypeCounts(events);
    const totalRevenue = events.filter((e) => e.event_type === "purchase").reduce((sum, e) => sum + (e.metadata.order_value || 0), 0);

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

export function getProductAnalytics(events: AnalyticsEvent[]): ProductAnalytics[] {
    const productMap = new Map<string, ProductAnalytics>();

    // Initialize all products
    products.forEach((product) => {
        productMap.set(product.id, {
            id: product.id,
            name: product.name,
            price: product.price,
            views: 0,
            addToCart: 0,
            purchases: 0,
            revenue: 0,
            conversionRate: 0,
        });
    });

    // Aggregate events by product
    events.forEach((event) => {
        const productId = event.metadata.product_id;
        if (!productId || !productMap.has(productId)) return;

        const product = productMap.get(productId)!;

        switch (event.event_type) {
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

// Session Analytics
export interface SessionData {
    id: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    duration: number; // in seconds
    events: AnalyticsEvent[];
    pageCount: number;
    productsViewed: number;
    didAddToCart: boolean;
    didPurchase: boolean;
    revenue: number;
    device: "desktop" | "mobile" | "tablet";
    source: "direct" | "organic" | "social" | "paid" | "referral";
}

export function getSessionsFromEvents(events: AnalyticsEvent[]): SessionData[] {
    const sessionMap = new Map<string, AnalyticsEvent[]>();

    // Group events by session_id
    events.forEach((event) => {
        const sessionEvents = sessionMap.get(event.session_id) || [];
        sessionEvents.push(event);
        sessionMap.set(event.session_id, sessionEvents);
    });

    const devices: SessionData["device"][] = ["desktop", "mobile", "tablet"];
    const sources: SessionData["source"][] = ["direct", "organic", "social", "paid", "referral"];
    const deviceWeights = [0.55, 0.35, 0.1];
    const sourceWeights = [0.25, 0.35, 0.15, 0.15, 0.1];

    const sessions: SessionData[] = [];

    sessionMap.forEach((sessionEvents, sessionId) => {
        const sortedEvents = sessionEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        const startTime = sortedEvents[0].timestamp;
        const endTime = sortedEvents[sortedEvents.length - 1].timestamp;
        const duration = Math.max(30, Math.floor((endTime.getTime() - startTime.getTime()) / 1000) + Math.floor(Math.random() * 300));

        // Weighted random device selection
        let deviceRandom = Math.random();
        let device: SessionData["device"] = "desktop";
        for (let i = 0; i < deviceWeights.length; i++) {
            deviceRandom -= deviceWeights[i];
            if (deviceRandom <= 0) {
                device = devices[i];
                break;
            }
        }

        // Weighted random source selection
        let sourceRandom = Math.random();
        let source: SessionData["source"] = "direct";
        for (let i = 0; i < sourceWeights.length; i++) {
            sourceRandom -= sourceWeights[i];
            if (sourceRandom <= 0) {
                source = sources[i];
                break;
            }
        }

        const pageViews = sortedEvents.filter((e) => e.event_type === "page_view");
        const productViews = sortedEvents.filter((e) => e.event_type === "product_view");
        const addToCart = sortedEvents.some((e) => e.event_type === "add_to_cart");
        const purchases = sortedEvents.filter((e) => e.event_type === "purchase");
        const revenue = purchases.reduce((sum, e) => sum + (e.metadata.order_value || 0), 0);

        sessions.push({
            id: sessionId,
            userId: sortedEvents[0].user_id,
            startTime,
            endTime,
            duration,
            events: sortedEvents,
            pageCount: pageViews.length,
            productsViewed: productViews.length,
            didAddToCart: addToCart,
            didPurchase: purchases.length > 0,
            revenue,
            device,
            source,
        });
    });

    return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}

export function getSessionAnalytics(sessions: SessionData[]) {
    const totalSessions = sessions.length;
    const totalRevenue = sessions.reduce((sum, s) => sum + s.revenue, 0);
    const purchaseSessions = sessions.filter((s) => s.didPurchase).length;
    const conversionRate = totalSessions > 0 ? (purchaseSessions / totalSessions) * 100 : 0;
    const avgDuration = totalSessions > 0 ? sessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions : 0;
    const bounceRate = totalSessions > 0 ? (sessions.filter((s) => s.events.length === 1).length / totalSessions) * 100 : 0;

    // Device breakdown
    const deviceBreakdown = {
        desktop: sessions.filter((s) => s.device === "desktop").length,
        mobile: sessions.filter((s) => s.device === "mobile").length,
        tablet: sessions.filter((s) => s.device === "tablet").length,
    };

    // Source breakdown
    const sourceBreakdown = {
        direct: sessions.filter((s) => s.source === "direct").length,
        organic: sessions.filter((s) => s.source === "organic").length,
        social: sessions.filter((s) => s.source === "social").length,
        paid: sessions.filter((s) => s.source === "paid").length,
        referral: sessions.filter((s) => s.source === "referral").length,
    };

    return {
        totalSessions,
        totalRevenue,
        conversionRate,
        avgDuration,
        bounceRate,
        deviceBreakdown,
        sourceBreakdown,
    };
}

export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}
