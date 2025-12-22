import { AnalyticsEvent } from "./dummy-data";
import { currency } from "./utils";

export type NotificationType = "high_value_purchase" | "activity_spike" | "conversion_milestone" | "cart_abandonment_surge";

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    severity: "info" | "warning" | "success" | "critical";
    read: boolean;
    metadata?: Record<string, any>;
}

interface ActivityWindow {
    timestamp: Date;
    count: number;
}

export const DEFAULT_HIGH_VALUE_THRESHOLD = 350;
export const DEFAULT_ACTIVITY_SPIKE_MULTIPLIER = 2;
const NORMAL_EVENTS_PER_MINUTE = 5;

// Track recent activity for spike detection
let recentActivity: ActivityWindow[] = [];
let notificationIdCounter = 0;

function generateNotificationId(): string {
    return `notif_${++notificationIdCounter}_${Date.now()}`;
}

export function checkForHighValuePurchase(event: AnalyticsEvent, threshold: number = DEFAULT_HIGH_VALUE_THRESHOLD): Notification | null {
    if (event.eventType !== "purchase") return null;

    const orderValue = event.metadata.order_value || 0;

    if (orderValue >= threshold) {
        return {
            id: generateNotificationId(),
            type: "high_value_purchase",
            title: "High-Value Purchase! 🎉",
            message: `New order worth ${currency(orderValue)} just came in`,
            timestamp: new Date(),
            severity: "success",
            read: false,
            metadata: { orderValue },
        };
    }

    return null;
}

export function checkForActivitySpike(events: AnalyticsEvent[], spikeMultiplier: number = DEFAULT_ACTIVITY_SPIKE_MULTIPLIER): Notification | null {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Count events in the last minute
    const recentCount = events.filter((e) => e.timestamp >= oneMinuteAgo).length;

    // Update activity window
    recentActivity = recentActivity.filter((a) => a.timestamp >= oneMinuteAgo);
    recentActivity.push({ timestamp: now, count: recentCount });

    // Calculate average activity
    const avgActivity =
        recentActivity.length > 0 ? recentActivity.reduce((sum, a) => sum + a.count, 0) / recentActivity.length : NORMAL_EVENTS_PER_MINUTE;

    // Check for spike
    if (recentCount > avgActivity * spikeMultiplier && recentCount > 10) {
        return {
            id: generateNotificationId(),
            type: "activity_spike",
            title: "Activity Spike Detected! 📈",
            message: `${recentCount} events in the last minute (${Math.round((recentCount / avgActivity) * 100)}% above normal)`,
            timestamp: new Date(),
            severity: "warning",
            read: false,
            metadata: { recentCount, avgActivity },
        };
    }

    return null;
}

export function checkForConversionMilestone(events: AnalyticsEvent[], lastMilestone: number): Notification | null {
    const purchases = events.filter((e) => e.eventType === "purchase").length;
    const milestones = [10, 25, 50, 100, 250, 500, 1000];

    for (const milestone of milestones) {
        if (purchases >= milestone && lastMilestone < milestone) {
            return {
                id: generateNotificationId(),
                type: "conversion_milestone",
                title: `${milestone} Purchases Milestone! 🏆`,
                message: `You've reached ${milestone} successful purchases today`,
                timestamp: new Date(),
                severity: "success",
                read: false,
                metadata: { milestone, totalPurchases: purchases },
            };
        }
    }

    return null;
}

export function getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
        high_value_purchase: "💰",
        activity_spike: "📊",
        conversion_milestone: "🏆",
        cart_abandonment_surge: "⚠️",
    };
    return icons[type];
}

export function getNotificationColor(severity: Notification["severity"]): string {
    const colors: Record<Notification["severity"], string> = {
        info: "text-blue-400",
        warning: "text-amber-400",
        success: "text-emerald-400",
        critical: "text-red-400",
    };
    return colors[severity];
}

export function getNotificationBgColor(severity: Notification["severity"]): string {
    const colors: Record<Notification["severity"], string> = {
        info: "bg-blue-500/10 border-blue-500/20",
        warning: "bg-amber-500/10 border-amber-500/20",
        success: "bg-emerald-500/10 border-emerald-500/20",
        critical: "bg-red-500/10 border-red-500/20",
    };
    return colors[severity];
}
