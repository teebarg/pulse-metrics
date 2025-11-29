import { describe, it, expect, vi, beforeEach } from "vitest";
import PulseMetrics from "../src/index";

describe("PulseMetrics SDK", () => {
    beforeEach(() => {
        // Reset SDK state
        PulseMetrics.reset();
    });

    it("initializes with config", () => {
        PulseMetrics.init({ apiKey: "test_key" });
        expect(PulseMetrics.isReady()).toBe(true);
    });

    it("tracks events", () => {
        PulseMetrics.init({ apiKey: "test_key" });
        PulseMetrics.track("test_event", { value: 123 });
        expect(PulseMetrics.getQueueSize()).toBe(1);
    });

    it("batches events", async () => {
        vi.useFakeTimers();
        const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true })));

        PulseMetrics.init({ apiKey: "test_key" });
        PulseMetrics.track("event1");
        PulseMetrics.track("event2");

        vi.advanceTimersByTime(5000);
        await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled());

        expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining("/events/batch"), expect.any(Object));

        vi.restoreAllMocks();
    });
});
