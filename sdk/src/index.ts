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

class PulseMetrics {
    private config: Required<PulseMetricsConfig>;
    private sessionId: string;
    private userId?: string;
    private eventQueue: any[] = [];
    private flushInterval?: number;
    private isInitialized = false;

    constructor() {
        this.config = {
            apiKey: "",
            apiUrl: "https://api.pulsemetrics.io",
            autoTrack: true,
            debug: false,
        };
        this.sessionId = this.generateSessionId();
    }

    /**
     * Initialize PulseMetrics
     */
    init(config: PulseMetricsConfig): void {
        this.config = { ...this.config, ...config };

        if (!this.config.apiKey) {
            console.error("PulseMetrics: API key is required");
            return;
        }

        this.isInitialized = true;
        this.log("Initialized with config:", this.config);

        // Auto-track page views
        if (this.config.autoTrack) {
            this.trackPageView();
            this.setupAutoTracking();
        }

        // Start batch flushing (every 5 seconds)
        this.startBatchFlushing();

        // Flush on page unload
        if (typeof window !== "undefined") {
            window.addEventListener("beforeunload", () => this.flush());
        }
    }

    /**
     * Track custom event
     */
    track(eventType: EventType, properties?: EventProperties): void {
        if (!this.isInitialized) {
            console.warn("PulseMetrics: Not initialized. Call init() first.");
            return;
        }

        const event = {
            event_type: eventType,
            session_id: this.sessionId,
            user_id: this.userId,
            properties: {
                ...properties,
                referrer: document.referrer || undefined,
                url: window.location.href,
                user_agent: navigator.userAgent,
            },
            timestamp: new Date().toISOString(),
        };

        this.log("Tracking event:", event);
        this.eventQueue.push(event);

        // Flush immediately for important events
        if (["purchase", "checkout"].includes(eventType)) {
            this.flush();
        }
    }

    /**
     * Track page view
     */
    trackPageView(properties?: EventProperties): void {
        this.track("page_view", {
            page: window.location.pathname,
            title: document.title,
            ...properties,
        });
    }

    /**
     * Track product view
     */
    trackProductView(productId: string, productName: string, price?: number): void {
        this.track("product_view", {
            product_id: productId,
            product_name: productName,
            price,
        });
    }

    /**
     * Track add to cart
     */
    trackAddToCart(productId: string, productName: string, price: number, quantity = 1): void {
        this.track("add_to_cart", {
            product_id: productId,
            product_name: productName,
            price,
            quantity,
        });
    }

    /**
     * Track checkout started
     */
    trackCheckout(revenue: number, currency = "USD"): void {
        this.track("checkout", {
            revenue,
            currency,
        });
    }

    /**
     * Track purchase completed
     */
    trackPurchase(orderId: string, revenue: number, currency = "USD", properties?: EventProperties): void {
        this.track("purchase", {
            order_id: orderId,
            revenue,
            currency,
            ...properties,
        });
    }

    /**
     * Identify user
     */
    identify(userId: string): void {
        this.userId = userId;
        this.log("User identified:", userId);
    }

    /**
     * Reset session (e.g., on logout)
     */
    reset(): void {
        this.sessionId = this.generateSessionId();
        this.userId = undefined;
        this.log("Session reset");
    }

    /**
     * Flush events immediately
     */
    async flush(): Promise<void> {
        if (this.eventQueue.length === 0) return;

        const events = [...this.eventQueue];
        this.eventQueue = [];

        try {
            const response = await fetch(`${this.config.apiUrl}/events/batch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": this.config.apiKey,
                },
                body: JSON.stringify({ events }),
                keepalive: true, // Important for beforeunload
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("PulseMetrics: Failed to send events:", error);
                // Re-add events to queue on failure
                this.eventQueue.unshift(...events);
            } else {
                this.log(`Successfully sent ${events.length} events`);
            }
        } catch (error) {
            console.error("PulseMetrics: Network error:", error);
            // Re-add events to queue on failure
            this.eventQueue.unshift(...events);
        }
    }

    /**
     * Setup automatic tracking
     */
    private setupAutoTracking(): void {
        // Track clicks on product links
        document.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            const productLink = target.closest("[data-pulse-product]");

            if (productLink) {
                const productId = productLink.getAttribute("data-pulse-product-id");
                const productName = productLink.getAttribute("data-pulse-product-name");
                const price = parseFloat(productLink.getAttribute("data-pulse-product-price") || "0");

                if (productId && productName) {
                    this.trackProductView(productId, productName, price);
                }
            }
        });

        // Track form submissions (e.g., checkout)
        document.addEventListener("submit", (e) => {
            const form = e.target as HTMLFormElement;

            if (form.hasAttribute("data-pulse-checkout")) {
                const revenue = parseFloat(form.getAttribute("data-pulse-revenue") || "0");
                if (revenue > 0) {
                    this.trackCheckout(revenue);
                }
            }
        });

        // Track page visibility changes (user leaves/returns)
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                this.flush();
            }
        });
    }

    /**
     * Start batch flushing
     */
    private startBatchFlushing(): void {
        if (typeof window === "undefined") return;

        this.flushInterval = window.setInterval(() => {
            if (this.eventQueue.length > 0) {
                this.flush();
            }
        }, 5000); // Flush every 5 seconds
    }

    /**
     * Generate unique session ID
     */
    private generateSessionId(): string {
        // Try to get existing session from sessionStorage
        if (typeof window !== "undefined" && window.sessionStorage) {
            const existing = sessionStorage.getItem("pulse_session_id");
            if (existing) return existing;

            const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem("pulse_session_id", newId);
            return newId;
        }

        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Debug logging
     */
    private log(...args: any[]): void {
        if (this.config.debug) {
            console.log("[PulseMetrics]", ...args);
        }
    }
}

// Create singleton instance
const pulsemetrics = new PulseMetrics();

// Export for ES modules
export default pulsemetrics;

// Also expose globally for <script> tag usage
if (typeof window !== "undefined") {
    (window as any).PulseMetrics = pulsemetrics;
}

// Usage examples (for documentation):
/*

// Basic initialization
<script src="https://cdn.pulsemetrics.io/sdk.js"></script>
<script>
  PulseMetrics.init({
    apiKey: 'your_api_key_here',
    debug: true
  });
</script>

// Track custom events
PulseMetrics.track('add_to_cart', {
  product_id: '123',
  product_name: 'Cool T-Shirt',
  price: 29.99,
  quantity: 1
});

// Track purchase
PulseMetrics.trackPurchase('order_789', 99.99, 'USD', {
  items: 3,
  shipping: 5.99
});

// Identify user
PulseMetrics.identify('user_456');

// Auto-tracking with data attributes
<a href="/product/123"
   data-pulse-product
   data-pulse-product-id="123"
   data-pulse-product-name="Cool T-Shirt"
   data-pulse-product-price="29.99">
  View Product
</a>

<form data-pulse-checkout data-pulse-revenue="99.99">
  <!-- Checkout form -->
</form>

*/
