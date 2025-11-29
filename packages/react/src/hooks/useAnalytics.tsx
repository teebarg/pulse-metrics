import { useContext } from "react";
import { AnalyticsContext, AnalyticsContextValue } from "../provider";

export function useAnalytics(): AnalyticsContextValue {
    const context = useContext(AnalyticsContext);

    if (!context) {
        throw new Error("useAnalytics must be used within AnalyticsProvider");
    }

    return context;
}