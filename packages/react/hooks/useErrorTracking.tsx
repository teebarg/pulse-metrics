import { useEffect } from "react";
import { useAnalytics } from "./useAnalytics";

export function useErrorTracking() {
    const { track } = useAnalytics();

    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            track("error", {
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
            });
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            track("unhandled_rejection", {
                reason: event.reason?.toString(),
            });
        };

        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleUnhandledRejection);

        return () => {
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        };
    }, [track]);
}
