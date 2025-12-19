import { AnalyticsInstance } from ".";
import { EventMetadata } from "./types";

/**
 * Main composable to access analytics
 */
export function useAnalytics(): AnalyticsInstance {
    const analytics = inject<AnalyticsInstance>(AnalyticsKey);

    if (!analytics) {
        throw new Error("useAnalytics must be called after installing PulseMetricsPlugin");
    }

    return analytics;
}

/**
 * Simple composable for tracking events
 */
export function useTrack() {
    const analytics = useAnalytics();

    const track = (event: string, metadata?: EventMetadata) => {
        analytics.track(event, metadata);
    };

    const trackClick = (element: string, metadata?: EventMetadata) => {
        analytics.track("click", { element, ...metadata });
    };

    const trackPageView = (metadata?: EventMetadata) => {
        analytics.track("page_view", {
            page: window.location.pathname,
            title: document.title,
            ...metadata,
        });
    };

    return { track, trackClick, trackPageView };
}

/**
 * Auto-track page views on route changes (Vue Router)
 */
export function usePageTracking(route: Ref<any>) {
    const analytics = useAnalytics();

    watch(
        () => route.value.fullPath,
        (newPath) => {
            analytics.track("page_view", {
                page: newPath,
                title: document.title,
                route: route.value.name,
                params: route.value.params,
            });
        },
        { immediate: true }
    );
}

/**
 * Track component lifecycle
 */
export function useComponentTracking(componentName: string, metadata?: EventMetadata) {
    const analytics = useAnalytics();

    onMounted(() => {
        analytics.track("component_mounted", {
            component: componentName,
            ...metadata,
        });
    });

    onUnmounted(() => {
        analytics.track("component_unmounted", {
            component: componentName,
            ...metadata,
        });
    });
}

/**
 * Track form submissions
 */
export function useFormTracking(formName: string) {
    const analytics = useAnalytics();

    const trackFormStart = () => {
        analytics.track("form_started", { form: formName });
    };

    const trackFormSubmit = (success: boolean, data?: EventMetadata) => {
        analytics.track(success ? "form_submitted" : "form_error", {
            form: formName,
            ...data,
        });
    };

    const trackFieldChange = (field: string) => {
        analytics.track("form_field_changed", {
            form: formName,
            field,
        });
    };

    return {
        trackFormStart,
        trackFormSubmit,
        trackFieldChange,
    };
}

/**
 * Track user interactions
 */
export function useInteractionTracking() {
    const analytics = useAnalytics();

    const trackClick = (element: string, metadata?: EventMetadata) => {
        analytics.track("click", { element, ...metadata });
    };

    const trackScroll = (depth: number) => {
        analytics.track("scroll", { depth, page: window.location.pathname });
    };

    const trackTimeOnPage = () => {
        const startTime = Date.now();

        onUnmounted(() => {
            const duration = Date.now() - startTime;
            analytics.track("time_on_page", {
                duration: Math.round(duration / 1000),
                page: window.location.pathname,
            });
        });
    };

    return {
        trackClick,
        trackScroll,
        trackTimeOnPage,
    };
}

/**
 * Track errors
 */
export function useErrorTracking() {
    const analytics = useAnalytics();

    onMounted(() => {
        const handleError = (event: ErrorEvent) => {
            analytics.track("error", {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
            });
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            analytics.track("unhandled_rejection", {
                reason: event.reason?.toString(),
            });
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleUnhandledRejection);

        onUnmounted(() => {
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        });
    });
}
