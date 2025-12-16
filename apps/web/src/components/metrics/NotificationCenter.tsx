import { useState } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Notification, getNotificationIcon, getNotificationBgColor } from "@/lib/notification.service";

interface NotificationCenterProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onDismiss: (id: string) => void;
}

export function NotificationCenter({ notifications, onMarkAsRead, onMarkAllAsRead, onDismiss }: NotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-card/95 backdrop-blur-xl border-border" align="end" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" onClick={onMarkAllAsRead}>
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[320px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer relative group",
                                        !notification.read && "bg-primary/5"
                                    )}
                                    onClick={() => onMarkAsRead(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div
                                            className={cn(
                                                "h-10 w-10 rounded-lg flex items-center justify-center text-lg border shrink-0",
                                                getNotificationBgColor(notification.severity)
                                            )}
                                        >
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p
                                                    className={cn(
                                                        "text-sm font-medium truncate",
                                                        notification.read ? "text-muted-foreground" : "text-foreground"
                                                    )}
                                                >
                                                    {notification.title}
                                                </p>
                                                {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1">{formatTime(notification.timestamp)}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDismiss(notification.id);
                                        }}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
