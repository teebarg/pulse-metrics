import { useState, useEffect, useCallback, useRef } from "react";

interface VerificationResult {
    eventsReceived: number;
    isVerified: boolean;
    lastEventType?: string;
    lastEventTimestamp?: string;
}

export function useEventVerification(organizationId: string | null) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [eventsReceived, setEventsReceived] = useState(0);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollingIntervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);
    const lastEventCountRef = useRef<number>(0);

    // Start verification process
    const startVerification = useCallback(() => {
        if (!organizationId) {
            setError("Organization ID is required");
            return;
        }

        setIsVerifying(true);
        setEventsReceived(0);
        setIsVerified(false);
        setError(null);
        startTimeRef.current = Date.now();
        lastEventCountRef.current = 0;

        // Poll API every 2 seconds to check for new events
        pollingIntervalRef.current = window.setInterval(async () => {
            try {
                const response = await fetch("/api/onboarding/verify", {
                    headers: {
                        Authorization: `Bearer ${organizationId}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Verification request failed");
                }

                const data: VerificationResult = await response.json();

                // Update event count
                if (data.eventsReceived > lastEventCountRef.current) {
                    setEventsReceived(data.eventsReceived);
                    lastEventCountRef.current = data.eventsReceived;
                }

                // Check if verification complete (5+ events received)
                if (data.eventsReceived >= 5 && !isVerified) {
                    setIsVerified(true);
                    stopVerification();

                    // Auto-advance after success animation
                    setTimeout(() => {
                        // This would call the onComplete callback
                    }, 1500);
                }

                // Timeout after 5 minutes
                const elapsedTime = Date.now() - startTimeRef.current;
                if (elapsedTime > 5 * 60 * 1000) {
                    stopVerification();
                    setError("Verification timeout. Please try again or skip.");
                }
            } catch (err) {
                console.error("Verification error:", err);
                setError(err instanceof Error ? err.message : "Verification failed");
                stopVerification();
            }
        }, 2000); // Poll every 2 seconds
    }, [organizationId, isVerified]);

    // Stop verification process
    const stopVerification = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setIsVerifying(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    return {
        isVerifying,
        eventsReceived,
        isVerified,
        error,
        startVerification,
        stopVerification,
    };
}
