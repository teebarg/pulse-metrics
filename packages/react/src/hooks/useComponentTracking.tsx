import { useEffect } from "react";
import { EventMetadata } from "../types";
import { useAnalytics } from "./useAnalytics";

export function useComponentTracking(componentName: string, metadata?: EventMetadata) {
    const { track } = useAnalytics();

    useEffect(() => {
        track("component_mounted", {
            component: componentName,
            ...metadata,
        });

        return () => {
            track("component_unmounted", {
                component: componentName,
                ...metadata,
            });
        };
    }, [componentName, track]);
}
