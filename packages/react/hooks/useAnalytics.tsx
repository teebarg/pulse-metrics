import { useContext } from "react";
import { AnalyticsContextValue } from "..";
import { AnalyticsContext } from "../provider";

export function useAnalytics(): AnalyticsContextValue {
    const context = useContext(AnalyticsContext);

    if (!context) {
        throw new Error("useAnalytics must be used within AnalyticsProvider");
    }

    return context;
}