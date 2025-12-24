import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";
import { NotificationCenter } from "@/components/metrics/NotificationCenter";
import { NotificationSettings } from "@/components/metrics/NotificationSettings";
import { Notification } from "@/lib/notification.service";
import { Settings } from "~/server-fn/settings.fn";

interface HeaderProps {
    className?: string;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onDismissNotification: (id: string) => void;
    settings: Settings;
}

export function Header({ className, notifications, onMarkAsRead, onMarkAllAsRead, onDismissNotification, settings }: HeaderProps) {
    return (
        <header className={cn("border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50", className)}>
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 glow">
                            <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground tracking-tight">MetricFlow</h1>
                            <p className="text-xs text-muted-foreground">Real-time E-commerce Analytics</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <NotificationCenter
                            notifications={notifications}
                            onMarkAsRead={onMarkAsRead}
                            onMarkAllAsRead={onMarkAllAsRead}
                            onDismiss={onDismissNotification}
                        />
                        <NotificationSettings settings={settings} />
                    </div>
                </div>
            </div>
        </header>
    );
}
