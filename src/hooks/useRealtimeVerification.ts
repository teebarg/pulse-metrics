import { useState, useEffect, useCallback, useRef } from "react";
import { useWebSocket } from "pulsews";
import { useOrganization } from "~/providers/organization-provider";

export function useRealtimeVerification(count: number = 0) {
    const { data } = useOrganization();
    const { lastMessage, send } = useWebSocket();
    const [isVerifying, setIsVerifying] = useState(false);
    const [eventsReceived, setEventsReceived] = useState(count);
    const [isVerified, setIsVerified] = useState(false);

    const autoStarted = useRef(false);

    const startVerification = useCallback(() => {
        setIsVerifying(true);
        setEventsReceived(0);
        setIsVerified(false);
        send(JSON.stringify({ type: "subscribe", tables: ["organizations"], filters: { id: data.organizationId } }));
    }, [send]);

    const stopVerification = useCallback(() => {
        send(JSON.stringify({ type: "unsubscribe", tables: ["organizations"], filters: { id: data.organizationId } }));
        setIsVerifying(false);
    }, [send]);

    useEffect(() => {
        if (autoStarted.current) return;

        if (count > 0 && count < 5) {
            autoStarted.current = true;
            setIsVerifying(true);
            setEventsReceived(count);
            send(JSON.stringify({ type: "subscribe", tables: ["organizations"], filters: { id: data.organizationId } }));
        }

        if (count >= 5) {
            autoStarted.current = true;
            setEventsReceived(count);
            setIsVerified(true);
            setIsVerifying(false);
        }
    }, [count, send]);

    useEffect(() => {
        if (!lastMessage || lastMessage.type != "events") return;

        const parsed = lastMessage?.data;

        if (parsed?.events_received != null) {
            const newCount = parsed.events_received;
            setEventsReceived(newCount);

            if (newCount > 0 && newCount < 5) {
                setIsVerifying(true);
            }

            if (newCount >= 5) {
                setIsVerified(true);
                setIsVerifying(false);
            }
        }
    }, [lastMessage]);

    return {
        isVerifying,
        eventsReceived,
        isVerified,
        startVerification,
        stopVerification,
    };
}
