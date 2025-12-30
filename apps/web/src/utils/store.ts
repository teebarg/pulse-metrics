import { Store } from "@tanstack/react-store";
import { AnalyticsEvent } from "~/lib/dummy-data";

export type AnalyticsState = {
    events: AnalyticsEvent[];
};

export const store = new Store<AnalyticsState>({
    events: [] as AnalyticsEvent[],
});

export const updateState = (events: AnalyticsEvent[]) => {
    store.setState((state: any) => {
        return {
            ...state,
            events,
        };
    });
};
