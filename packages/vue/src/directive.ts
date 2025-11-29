import { AnalyticsInstance } from "./types";

/**
 * v-track directive for easy event tracking
 * Usage: <button v-track:click="{ event: 'button_clicked', element: 'cta' }">
 */
export const vTrack = {
    mounted(el: HTMLElement, binding: any) {
        const { value, arg } = binding;
        const analytics = inject<AnalyticsInstance>(AnalyticsKey);

        if (!analytics) {
            console.warn("v-track: Analytics not available");
            return;
        }

        const eventType = arg || "click";
        const handler = () => {
            if (typeof value === "string") {
                analytics.track(value);
            } else {
                const { event, ...properties } = value;
                analytics.track(event || eventType, properties);
            }
        };

        el.addEventListener(eventType, handler);
        el._trackHandler = handler;
    },
    unmounted(el: HTMLElement, binding: any) {
        const eventType = binding.arg || "click";
        if (el._trackHandler) {
            el.removeEventListener(eventType, el._trackHandler);
        }
    },
};
