import { useCallback } from "react";
import { EventProperties } from "../types";
import { useAnalytics } from "./useAnalytics";

export function useTrack() {
    const { track } = useAnalytics();

    const trackEvent = useCallback(
        (event: string, properties?: EventProperties) => {
            track(event, properties);
        },
        [track]
    );

    const trackClick = useCallback(
        (element: string, properties?: EventProperties) => {
            track("click", { element, ...properties });
        },
        [track]
    );

    const trackPageView = useCallback(
        (properties?: EventProperties) => {
            track("page_view", {
                page: window.location.pathname,
                title: document.title,
                ...properties,
            });
        },
        [track]
    );

    return { track: trackEvent, trackClick, trackPageView };
}
