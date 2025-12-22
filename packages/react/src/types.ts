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

export interface TrackFunction {
    (event: string, metadata?: EventMetadata): void;
}