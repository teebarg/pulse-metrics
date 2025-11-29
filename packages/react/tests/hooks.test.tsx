import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AnalyticsProvider, useAnalytics } from "../src/index";

describe("useAnalytics", () => {
    it("throws error when used outside provider", () => {
        expect(() => {
            renderHook(() => useAnalytics());
        }).toThrow();
    });

    it("provides analytics instance", () => {
        const wrapper = ({ children }) => <AnalyticsProvider config={{ apiKey: "test" }}>{children}</AnalyticsProvider>;

        const { result } = renderHook(() => useAnalytics(), { wrapper });

        expect(result.current.track).toBeDefined();
        expect(result.current.identify).toBeDefined();
    });

    it("tracks events", () => {
        const wrapper = ({ children }) => <AnalyticsProvider config={{ apiKey: "test" }}>{children}</AnalyticsProvider>;

        const { result } = renderHook(() => useAnalytics(), { wrapper });

        act(() => {
            result.current.track("test_event", { value: 123 });
        });

        expect(result.current.queueSize).toBeGreaterThan(0);
    });
});
