const AnalyticsKey: InjectionKey<AnalyticsInstance> = Symbol("PulseMetrics");

export const PulseMetricsPlugin: Plugin = {
    install(app: App, config: PulseMetricsConfig) {
        const sdk = new PulseMetricsCore(config);

        const analyticsInstance: AnalyticsInstance = {
            track: (event: string, metadata?: EventMetadata) => {
                sdk.track(event, metadata);
            },
            identify: (userId: string) => {
                sdk.identify(userId);
            },
            reset: () => {
                sdk.reset();
            },
            flush: () => sdk.flush(),
            queueSize: computed(() => sdk.getQueueSize().value),
            isReady: true,
        };

        // Provide for Composition API
        app.provide(AnalyticsKey, analyticsInstance);

        // Add to global properties for Options API
        app.config.globalProperties.$analytics = analyticsInstance;
    },
};
