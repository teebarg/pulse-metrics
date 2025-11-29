import { PulseMetricsPlugin } from "./plugin";
import { AnalyticsInstance, PulseMetricsConfig, TrackedEvent } from "./types";
import { EventProperties } from "../react";

// ============================================================================
// Options API Support
// ============================================================================

declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $analytics: AnalyticsInstance;
    }
}

// ============================================================================
// Package Exports
// ============================================================================

export default PulseMetricsPlugin;

export type { PulseMetricsConfig, EventProperties, TrackedEvent, AnalyticsInstance };
