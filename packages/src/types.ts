interface PulseMetricsConfig {
    apiKey: string;
    apiUrl?: string;
    autoTrack?: boolean;
    debug?: boolean;
}

interface EventProperties {
    page?: string;
    product_id?: string;
    product_name?: string;
    price?: number;
    quantity?: number;
    revenue?: number;
    currency?: string;
    referrer?: string;
    [key: string]: any;
}

type EventType = "page_view" | "product_view" | "add_to_cart" | "checkout" | "purchase";
