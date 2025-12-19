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
    event_type: string;
    session_id: string;
    user_id?: string;
    metadata?: EventMetadata;
    timestamp: string;
}

export interface TrackFunction {
    (event: string, metadata?: EventMetadata): void;
}