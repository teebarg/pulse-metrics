import { App, Plugin, inject, onMounted, onUnmounted, watch, ref, computed, InjectionKey } from "vue";
import type { Ref, ComputedRef } from "vue";
import { EventProperties, PulseMetricsConfig, TrackedEvent } from "./types";

class PulseMetricsCore {
    private config: Required<PulseMetricsConfig>;
    private queue: TrackedEvent[] = [];
    private sessionId: string;
    private userId?: string;
    private flushTimer?: number;
    private isInitialized = false;
    private queueSizeRef: Ref<number>;

    constructor(config: PulseMetricsConfig) {
        this.config = {
            apiUrl: "https://api.pulsemetrics.io",
            debug: false,
            autoTrack: true,
            flushInterval: 5000,
            maxBatchSize: 100,
            ...config,
        };

        this.queueSizeRef = ref(0);
        this.sessionId = this.generateSessionId();
        this.isInitialized = true;
        this.startBatchFlushing();

        // Flush on page unload
        if (typeof window !== "undefined") {
            window.addEventListener("beforeunload", () => this.flush());
            window.addEventListener("visibilitychange", () => {
                if (document.hidden) this.flush();
            });
        }

        this.log("Initialized");
    }

    track(eventType: string, properties?: EventProperties): void {
        if (!this.isInitialized) {
            this.error("SDK not initialized");
            return;
        }

        const event: TrackedEvent = {
            event_type: eventType,
            session_id: this.sessionId,
            user_id: this.userId,
            properties: {
                ...properties,
                url: typeof window !== "undefined" ? window.location.href : undefined,
                path: typeof window !== "undefined" ? window.location.pathname : undefined,
            },
            timestamp: new Date().toISOString(),
        };

        this.log("Tracking event:", event);
        this.queue.push(event);
        this.queueSizeRef.value = this.queue.length;

        if (this.queue.length >= this.config.maxBatchSize) {
            this.flush();
        }
    }

    identify(userId: string): void {
        this.userId = userId;
        this.log("User identified:", userId);
        this.track("identify", { user_id: userId });
    }

    reset(): void {
        this.userId = undefined;
        this.sessionId = this.generateSessionId();
        this.log("Session reset");
    }

    async flush(): Promise<void> {
        if (this.queue.length === 0) return;

        const events = [...this.queue];
        this.queue = [];
        this.queueSizeRef.value = 0;

        try {
            const response = await fetch(`${this.config.apiUrl}/events/batch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": this.config.apiKey,
                },
                body: JSON.stringify({ events }),
                keepalive: true,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            this.log(`Sent ${events.length} events`);
        } catch (error) {
            this.error("Failed to send events:", error);
            this.queue.unshift(...events);
            this.queueSizeRef.value = this.queue.length;
        }
    }

    getQueueSize(): Ref<number> {
        return this.queueSizeRef;
    }

    private startBatchFlushing(): void {
        this.flushTimer = window.setInterval(() => {
            if (this.queue.length > 0) {
                this.flush();
            }
        }, this.config.flushInterval);
    }

    private generateSessionId(): string {
        if (typeof window !== "undefined" && window.sessionStorage) {
            const existing = sessionStorage.getItem("pulse_session_id");
            if (existing) return existing;

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
