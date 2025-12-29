import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { AnalyticsEvent } from "@/lib/dummy-data";
import { Notification, checkForHighValuePurchase, checkForActivitySpike, checkForConversionMilestone } from "@/lib//notification.service";
import { playNotificationSound, requestNotificationPermission, showBrowserNotification } from "@/lib/sound.service";
import { Settings } from "~/server-fn/settings.fn";

export interface NotificationThresholds {
    highValueThreshold: number;
    activitySpikeMultiplier: number;
}

export function useNotifications(settings: Settings) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const lastMilestoneRef = useRef(0);
    const lastSpikeCheckRef = useRef(0);

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    useEffect(() => {
        if (!settings || typeof window === "undefined") {
            return;
        }
        if (!settings?.browserNotificationsEnabled) {
            requestNotificationPermission();
        }
    }, [settings?.browserNotificationsEnabled]);

    const addNotification = useCallback(
        (notification: Notification) => {
            setNotifications((prev) => [notification, ...prev].slice(0, 50));

            toast(notification.title, {
                description: notification.message,
                duration: 5000,
            });

            if (settings?.soundEnabled) {
                const soundType = notification.severity === "success" ? "success" : notification.severity === "warning" ? "warning" : "info";
                playNotificationSound(soundType);
            }

            if (settings?.browserNotificationsEnabled && (notification.severity === "success" || notification.severity === "warning")) {
                showBrowserNotification(notification.title, notification.message);
            }
        },
        [settings?.soundEnabled, settings?.browserNotificationsEnabled]
    );

    const processEvent = useCallback(
        (event: AnalyticsEvent, allEvents: AnalyticsEvent[]) => {
            // Check for high-value purchases
            const highValueNotif = checkForHighValuePurchase(event, settings?.highValueThreshold);
            if (highValueNotif) {
                addNotification(highValueNotif);
            }

            // Check for activity spikes (throttled to once every 10 seconds)
            const now = Date.now();
            if (now - lastSpikeCheckRef.current > 10000) {
                const spikeNotif = checkForActivitySpike(allEvents, settings?.activitySpikeMultiplier);
                if (spikeNotif) {
                    addNotification(spikeNotif);
                }
                lastSpikeCheckRef.current = now;
            }

            const milestoneNotif = checkForConversionMilestone(allEvents, lastMilestoneRef.current);
            if (milestoneNotif) {
                lastMilestoneRef.current = milestoneNotif.metadata?.milestone || 0;
                addNotification(milestoneNotif);
            }
        },
        [addNotification, settings]
    );

    const markAsRead = useCallback((id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return {
        notifications,
        processEvent,
        markAsRead,
        markAllAsRead,
        dismissNotification,
    };
}
