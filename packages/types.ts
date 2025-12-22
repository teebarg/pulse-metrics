export interface PulseMetricsConfig {
    apiKey: string;
    apiUrl?: string;
    autoTrack?: boolean;
    debug?: boolean;
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

export type EventType = "page_view" | "product_view" | "add_to_cart" | "checkout" | "purchase";
