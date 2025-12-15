import { useCallback } from "react";

export function usePulseMetrics() {
    const track = useCallback((eventName: string, data?: Record<string, any>) => {
        if (typeof window !== "undefined" && window.PulseMetrics) {
            window.PulseMetrics.track(eventName, data);
        }
    }, []);

    const trackPageView = useCallback((pageName: string, additionalData?: Record<string, any>) => {
        if (typeof window !== "undefined" && window.PulseMetrics) {
            window.PulseMetrics.track("page_view", {
                page: pageName,
                url: window.location.href,
                referrer: document.referrer,
                timestamp: new Date().toISOString(),
                ...additionalData,
            });
        }
    }, []);

    const identify = useCallback((userId: string, traits?: Record<string, any>) => {
        if (typeof window !== "undefined" && window.PulseMetrics?.identify) {
            window.PulseMetrics.identify(userId, traits);
        }
    }, []);

    return { track, trackPageView, identify };
}
