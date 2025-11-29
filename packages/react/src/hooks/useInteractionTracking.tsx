import { useCallback } from "react";
import { EventProperties } from "../types";
import { useAnalytics } from "./useAnalytics";


export function useInteractionTracking() {
    const { track } = useAnalytics();

    const trackClick = useCallback(
        (element: string, properties?: EventProperties) => {
            track("click", { element, ...properties });
        },
        [track]
    );

    const trackScroll = useCallback(
        (depth: number) => {
            track("scroll", { depth, page: window.location.pathname });
        },
        [track]
    );

    const trackTimeOnPage = useCallback(() => {
        const startTime = Date.now();

        return () => {
            const duration = Date.now() - startTime;
            track("time_on_page", {
                duration: Math.round(duration / 1000), // seconds
                page: window.location.pathname,
            });
        };
    }, [track]);

    return {
        trackClick,
        trackScroll,
        trackTimeOnPage,
    };
}
