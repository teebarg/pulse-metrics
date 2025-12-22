import type { ComputedRef } from "vue";

export interface PulseMetricsConfig {
    apiKey: string;
    apiUrl?: string;
    debug?: boolean;
    autoTrack?: boolean;
    flushInterval?: number;
    maxBatchSize?: number;
}

export interface EventMetadata {
    [key: string]: any;
}

export interface TrackedEvent {
    eventType: string;
    sessionId: string;
    metadata?: EventMetadata;
    timestamp: string;
}

export interface AnalyticsInstance {
    track: (event: string, metadata?: EventMetadata) => void;
    identify: (userId: string) => void;
    reset: () => void;
    flush: () => Promise<void>;
    queueSize: ComputedRef<number>;
    isReady: boolean;
}
