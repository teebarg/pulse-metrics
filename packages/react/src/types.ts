export interface PulseMetricsConfig {
    apiKey: string;
    apiUrl?: string;
    debug?: boolean;
    autoTrack?: boolean;
    flushInterval?: number;
    maxBatchSize?: number;
}

export interface EventProperties {
    [key: string]: any;
}

export interface TrackedEvent {
    event_type: string;
    session_id: string;
    user_id?: string;
    properties?: EventProperties;
    timestamp: string;
}

export interface TrackFunction {
    (event: string, properties?: EventProperties): void;
}