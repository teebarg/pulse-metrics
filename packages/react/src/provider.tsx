import { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { PulseMetricsConfig, TrackFunction } from "./types";
import { PulseMetricsCore } from "./core";

export interface AnalyticsContextValue {
    track: TrackFunction;
    identify: (userId: string) => void;
    reset: () => void;
    isReady: boolean;
    queueSize: number;
}

export const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

interface AnalyticsProviderProps {
    children: ReactNode;
    config: PulseMetricsConfig;
    enabled?: boolean;
}

export function AnalyticsProvider({ children, config, enabled = true }: AnalyticsProviderProps) {
    const sdkRef = useRef<PulseMetricsCore | null>(null);
    const [queueSize, setQueueSize] = useState(0);

    useEffect(() => {
        if (!enabled) return;

        sdkRef.current = new PulseMetricsCore(config);

        // Subscribe to queue changes
        const unsubscribe = sdkRef.current.subscribe(() => {
            setQueueSize(sdkRef.current?.getQueueSize() || 0);
        });

        return () => {
            unsubscribe();
            sdkRef.current?.flush();
        };
    }, [config.apiKey, enabled]);

    const track = useCallback<TrackFunction>(
        (event: any, metadata: any) => {
            if (!enabled) return;
            sdkRef.current?.track(event, metadata);
        },
        [enabled]
    );

    const identify = useCallback(
        (userId: string) => {
            if (!enabled) return;
            sdkRef.current?.identify(userId);
        },
        [enabled]
    );

    const reset = useCallback(() => {
        if (!enabled) return;
        sdkRef.current?.reset();
    }, [enabled]);

    const value: AnalyticsContextValue = {
        track,
        identify,
        reset,
        isReady: enabled && sdkRef.current !== null,
        queueSize,
    };

    return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
