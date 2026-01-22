interface PulseMetricsConfig {
    apiKey: string;
    apiUrl?: string;
    autoTrack?: boolean;
    debug?: boolean;
    flushInterval?: number;
    maxBatchSize?: number;
    maxQueueSize?: number;
    retryAttempts?: number;
}

interface EventMetadata {
    [key: string]: any;
}

interface TrackedEvent {
    eventType: string;
    sessionId: string;
    metadata?: EventMetadata;
    timestamp: string;
}

class PulseMetricsSDK {
    private config: Required<PulseMetricsConfig>;
    private queue: TrackedEvent[] = [];
    private sessionId: string;
    private userId?: string;
    private flushTimer?: number;
    private isInitialized = false;
    private isFlushing = false;
    private retryQueue: TrackedEvent[] = [];

    constructor() {
        this.config = {
            apiKey: "",
            apiUrl: "https://api-pulse.revoque.com.ng/v1",
            autoTrack: true,
            debug: false,
            flushInterval: 5000, // 5 seconds
            maxBatchSize: 100,
            maxQueueSize: 1000,
            retryAttempts: 3,
        };

        this.sessionId = this.generateSessionId();
    }

    /**
     * Initialize the SDK
     */
    init(config: PulseMetricsConfig): void {
        if (this.isInitialized) {
            this.log("SDK already initialized");
            return;
        }

        if (!config.apiKey) {
            this.error("API key is required");
            return;
        }

        this.config = { ...this.config, ...config };
        this.isInitialized = true;

        this.log("Initialized with config:", this.config);

        // Start periodic flushing
        this.startBatchFlushing();

        // Setup page unload handler
        if (typeof window !== "undefined") {
            window.addEventListener("beforeunload", () => this.flush());
            window.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    this.flush();
                }
            });
        }

        // Auto-track page view
        if (this.config.autoTrack) {
            this.trackPageView();
        }
    }

    /**
     * Track a custom event
     */
    track(eventType: string, metadata?: EventMetadata): void {
        if (!this.isInitialized) {
            this.error("SDK not initialized. Call init() first.");
            return;
        }

        const event: TrackedEvent = {
            eventType: eventType,
            sessionId: this.sessionId,
            metadata: {
                ...metadata,
                url: typeof window !== "undefined" ? window.location.href : undefined,
                referrer: typeof document !== "undefined" ? document.referrer : undefined,
                user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
            },
            timestamp: new Date().toISOString(),
        };

        this.log("Tracking event:", event);

        this.addToQueue(event);

        // Flush immediately for critical events
        if (["purchase", "signup", "error"].includes(eventType)) {
            this.flush();
        }
    }

    /**
     * Track page view
     */
    trackPageView(metadata?: EventMetadata): void {
        if (typeof window === "undefined") return;

        this.track("page_view", {
            page: window.location.pathname,
            title: document.title,
            ...metadata,
        });
    }

    /**
     * Identify a user
     */
    identify(userId: string): void {
        this.userId = userId;
        this.log("User identified:", userId);
    }

    /**
     * Reset session (e.g., on logout)
     */
    reset(): void {
        this.userId = undefined;
        this.sessionId = this.generateSessionId();
        this.log("Session reset");
    }

    /**
     * Manually flush the queue
     */
    async flush(): Promise<void> {
        if (this.queue.length === 0 && this.retryQueue.length === 0) {
            return;
        }

        if (this.isFlushing) {
            this.log("Already flushing, skipping...");
            return;
        }

        this.isFlushing = true;

        // Combine queue and retry queue
        const eventsToSend = [...this.retryQueue, ...this.queue];
        this.queue = [];
        this.retryQueue = [];

        try {
            await this.sendEvents(eventsToSend);
            this.log(`Successfully sent ${eventsToSend.length} events`);
        } catch (error) {
            this.error("Failed to send events:", error);

            // Add back to retry queue (with limit)
            this.retryQueue = [...this.retryQueue, ...eventsToSend.slice(0, this.config.maxQueueSize)];
        } finally {
            this.isFlushing = false;
        }
    }

    /**
     * Get current queue size (for debugging)
     */
    getQueueSize(): number {
        return this.queue.length + this.retryQueue.length;
    }

    /**
     * Check if SDK is initialized
     */
    isReady(): boolean {
        return this.isInitialized;
    }


    private addToQueue(event: TrackedEvent): void {
        // Check queue size limit
        if (this.queue.length >= this.config.maxQueueSize) {
            this.error("Queue size limit reached, dropping oldest event");
            this.queue.shift(); // Remove oldest event
        }

        this.queue.push(event);

        // Flush if batch size reached
        if (this.queue.length >= this.config.maxBatchSize) {
            this.log("Batch size reached, flushing...");
            this.flush();
        }
    }

    private startBatchFlushing(): void {
        if (typeof window === "undefined") return;

        this.flushTimer = window.setInterval(() => {
            if (this.queue.length > 0) {
                this.flush();
            }
        }, this.config.flushInterval);
    }

    private async sendEvents(events: TrackedEvent[]): Promise<void> {
        if (events.length === 0) return;

        const url = `${this.config.apiUrl}/events/batch`;
        const payload = { events };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": this.config.apiKey,
                },
                body: JSON.stringify(payload),
                keepalive: true,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            this.error("Network error:", error);
            throw error;
        }
    }

    private generateSessionId(): string {
        if (typeof window !== "undefined" && window.sessionStorage) {
            const existingId = sessionStorage.getItem("pulse_session_id");
            if (existingId) return existingId;

            const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem("pulse_session_id", newId);
            return newId;
        }

        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private log(...args: any[]): void {
        if (this.config.debug) {
            console.log("[PulseMetrics]", ...args);
        }
    }

    private error(...args: any[]): void {
        console.error("[PulseMetrics]", ...args);
    }
}

// Create singleton instance
const pulsemetrics = new PulseMetricsSDK();

// Export for ES modules
export default pulsemetrics;

// Also expose on window for UMD builds
if (typeof window !== "undefined") {
    (window as any).PulseMetrics = pulsemetrics;
}

export type { PulseMetricsConfig, EventMetadata, TrackedEvent };
