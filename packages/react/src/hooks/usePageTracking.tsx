import { useEffect } from "react";
import { useAnalytics } from "./useAnalytics";

export function usePageTracking(dependencies: any[] = []) {
    const { track } = useAnalytics();

    useEffect(() => {
        track("page_view", {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
        });
    }, dependencies);
}
