import { useEffect } from "react";
import { EventProperties } from "../types";
import { useAnalytics } from "./useAnalytics";

export function useComponentTracking(componentName: string, properties?: EventProperties) {
    const { track } = useAnalytics();

    useEffect(() => {
        track("component_mounted", {
            component: componentName,
            ...properties,
        });

        return () => {
            track("component_unmounted", {
                component: componentName,
                ...properties,
            });
        };
    }, [componentName, track]);
}
