"use client";

export type EventType = "page_view" | "product_view" | "add_to_cart" | "checkout" | "purchase";

export interface PageViewEvent {
    page: string;
    title: string;
    referrer: string;
}

export interface ProductViewEvent {
    product_id: string;
    product_name: string;
    price: number;
    quantity?: number;
    revenue?: number;
    referrer?: string;
}

export interface AddToCartEvent {
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
}

export interface CheckoutEvent {
    cart_value: number;
    item_count: number;
}

export interface PurchaseEvent {
    order_id: string;
    order_value: number;
    items: Array<{
        product_id: string;
        quantity: number;
        price: number;
    }>;
}

export interface EventMetadata {
    page?: string;
    product_id?: string;
    product_name?: string;
    price?: number;
    quantity?: number;
    revenue?: number;
    referrer?: string;
    [key: string]: any;
}

type EventPayload = PageViewEvent | ProductViewEvent | AddToCartEvent | CheckoutEvent | PurchaseEvent;

// declare global {
//     interface Window {
//         PulseMetrics?: {
//             init: (config: { apiKey: string; apiUrl: string; debug?: boolean }) => void;
//             track: (event: string, payload?: unknown) => void;
//             identify?: (userId: string, traits?: unknown) => void;
//         };
//     }
// }

let initialized = false;

export function initPulseMetrics() {
    if (typeof window === "undefined") return;
    if (!window.PulseMetrics) return;
    if (initialized) return;

    window.PulseMetrics.init({
        apiKey: import.meta.env.VITE_PULSE_KEY,
        apiUrl: `${import.meta.env.VITE_API_URL}/v1`,
        debug: import.meta.env.DEV,
    });

    initialized = true;
}

export function trackPulseEvent(event: EventType, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    if (!window.PulseMetrics) return;

    window.PulseMetrics.track(event, payload);
}

// Track events
export const trackEvent = (eventType: EventType, properties: EventPayload) => {
    if (typeof window === "undefined") return;
    if (!window.PulseMetrics) return;

    window.PulseMetrics.track(eventType, properties);
};

export const analytics = {
    pageView: () => {
        trackEvent("page_view", {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
        });
    },

    productView: (properties: ProductViewEvent) => {
        trackEvent("product_view", properties);
    },

    addToCart: (properties: AddToCartEvent) => {
        trackEvent("add_to_cart", properties);
    },

    checkout: (properties: CheckoutEvent) => {
        trackEvent("checkout", properties);
    },

    purchase: (properties: PurchaseEvent) => {
        trackEvent("purchase", properties);
    },
};
