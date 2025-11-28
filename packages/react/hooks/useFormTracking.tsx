import { useCallback } from "react";
import { EventProperties } from "../types";
import { useAnalytics } from "./useAnalytics";

export function useFormTracking(formName: string) {
    const { track } = useAnalytics();

    const trackFormStart = useCallback(() => {
        track("form_started", { form: formName });
    }, [track, formName]);

    const trackFormSubmit = useCallback(
        (success: boolean, data?: EventProperties) => {
            track(success ? "form_submitted" : "form_error", {
                form: formName,
                ...data,
            });
        },
        [track, formName]
    );

    const trackFieldChange = useCallback(
        (field: string) => {
            track("form_field_changed", {
                form: formName,
                field,
            });
        },
        [track, formName]
    );

    return {
        trackFormStart,
        trackFormSubmit,
        trackFieldChange,
    };
}
