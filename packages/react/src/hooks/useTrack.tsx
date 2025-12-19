import { useCallback } from "react";
import { EventMetadata } from "../types";
import { useAnalytics } from "./useAnalytics";

export function useTrack() {
    const { track } = useAnalytics();

    const trackEvent = useCallback(
        (event: string, metadata?: EventMetadata) => {
            track(event, metadata);
        },
        [track]
    );

    const trackClick = useCallback(
        (element: string, metadata?: EventMetadata) => {
            track("click", { element, ...metadata });
        },
        [track]
    );

    const trackPageView = useCallback(
        (metadata?: EventMetadata) => {
            track("page_view", {
                page: window.location.pathname,
                title: document.title,
                ...metadata,
            });
        },
        [track]
    );

    return { track: trackEvent, trackClick, trackPageView };
}
