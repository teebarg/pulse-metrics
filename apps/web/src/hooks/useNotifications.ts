import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { AnalyticsEvent } from "@/lib/dummy-data";
import {
    Notification,
    checkForHighValuePurchase,
    checkForActivitySpike,
    checkForConversionMilestone,
    DEFAULT_HIGH_VALUE_THRESHOLD,
    DEFAULT_ACTIVITY_SPIKE_MULTIPLIER,
} from "@/lib//notification.service";
import { playNotificationSound, requestNotificationPermission, showBrowserNotification } from "@/lib/sound.service";

export interface NotificationThresholds {
    highValueThreshold: number;
    activitySpikeMultiplier: number;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);
    const [thresholds, setThresholds] = useState<NotificationThresholds>({
        highValueThreshold: DEFAULT_HIGH_VALUE_THRESHOLD,
        activitySpikeMultiplier: DEFAULT_ACTIVITY_SPIKE_MULTIPLIER,
    });
    const lastMilestoneRef = useRef(0);
    const lastSpikeCheckRef = useRef(0);

    useEffect(() => {
        requestNotificationPermission().then((granted) => {
            setBrowserNotificationsEnabled(granted);
        });
    }, []);

    const addNotification = useCallback(
        (notification: Notification) => {
            setNotifications((prev) => [notification, ...prev].slice(0, 50));

            toast(notification.title, {
                description: notification.message,
                duration: 5000,
            });

            if (soundEnabled) {
                const soundType = notification.severity === "success" ? "success" : notification.severity === "warning" ? "warning" : "info";
                playNotificationSound(soundType);
            }

            if (browserNotificationsEnabled && (notification.severity === "success" || notification.severity === "warning")) {
                showBrowserNotification(notification.title, notification.message);
            }
        },
        [soundEnabled, browserNotificationsEnabled]
    );

    const processEvent = useCallback(
        (event: AnalyticsEvent, allEvents: AnalyticsEvent[]) => {
            // Check for high-value purchases
            const highValueNotif = checkForHighValuePurchase(event, thresholds.highValueThreshold);
            if (highValueNotif) {
                addNotification(highValueNotif);
            }

            // Check for activity spikes (throttled to once every 10 seconds)
            const now = Date.now();
            if (now - lastSpikeCheckRef.current > 10000) {
                const spikeNotif = checkForActivitySpike(allEvents, thresholds.activitySpikeMultiplier);
                if (spikeNotif) {
                    addNotification(spikeNotif);
                }
                lastSpikeCheckRef.current = now;
            }

            // Check for conversion milestones
            const milestoneNotif = checkForConversionMilestone(allEvents, lastMilestoneRef.current);
            if (milestoneNotif) {
                lastMilestoneRef.current = milestoneNotif.metadata?.milestone || 0;
                addNotification(milestoneNotif);
            }
        },
        [addNotification, thresholds]
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

    const toggleSound = useCallback(() => {
        setSoundEnabled((prev) => !prev);
    }, []);

    const toggleBrowserNotifications = useCallback(async () => {
        if (!browserNotificationsEnabled) {
            const granted = await requestNotificationPermission();
            setBrowserNotificationsEnabled(granted);
        } else {
            setBrowserNotificationsEnabled(false);
        }
    }, [browserNotificationsEnabled]);

    const updateThresholds = useCallback((newThresholds: NotificationThresholds) => {
        setThresholds(newThresholds);
    }, []);

    return {
        notifications,
        processEvent,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        soundEnabled,
        toggleSound,
        browserNotificationsEnabled,
        toggleBrowserNotifications,
        thresholds,
        updateThresholds,
    };
}
