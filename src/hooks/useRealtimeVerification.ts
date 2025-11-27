import { useState, useEffect, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useRealtimeVerification(organizationId: string | null) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [eventsReceived, setEventsReceived] = useState(0);
    const [isVerified, setIsVerified] = useState(false);
    const [recentEvents, setRecentEvents] = useState<any[]>([]);

    let channelRef: RealtimeChannel | null = null;

    const startVerification = useCallback(async () => {
        if (!organizationId) return;

        setIsVerifying(true);
        setEventsReceived(0);
        setIsVerified(false);
        setRecentEvents([]);

        try {
            // Get initial count
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

            const { count, data: initialEvents } = await supabase
                .from("events")
                .select("*", { count: "exact" })
                .eq("organization_id", organizationId)
                .gte("timestamp", fiveMinutesAgo)
                .order("timestamp", { ascending: false })
                .limit(10);

            setEventsReceived(count || 0);
            setRecentEvents(initialEvents || []);

            // Subscribe to real-time updates
            channelRef = supabase
                .channel(`verification:${organizationId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "events",
                        filter: `organization_id=eq.${organizationId}`,
                    },
                    (payload) => {
                        console.log("New event received!", payload);

                        // Update count
                        setEventsReceived((prev) => {
                            const newCount = prev + 1;

                            // Check if verified (5+ events)
                            if (newCount >= 5 && !isVerified) {
                                setIsVerified(true);
                                setIsVerifying(false);

                                // Unsubscribe after verification
                                if (channelRef) {
                                    supabase.removeChannel(channelRef);
                                }
                            }

                            return newCount;
                        });

                        // Add to recent events list
                        setRecentEvents((prev) => [payload.new, ...prev.slice(0, 9)]);
                    }
                )
                .subscribe((status: any) => {
                    console.log("Realtime subscription status:", status);
                });
        } catch (error) {
            console.error("Verification setup error:", error);
            setIsVerifying(false);
        }
    }, [organizationId, isVerified]);

    const stopVerification = useCallback(() => {
        if (channelRef) {
            supabase.removeChannel(channelRef);
            channelRef = null;
        }
        setIsVerifying(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (channelRef) {
                supabase.removeChannel(channelRef);
            }
        };
    }, []);

    return {
        isVerifying,
        eventsReceived,
        isVerified,
        recentEvents,
        startVerification,
        stopVerification,
    };
}
