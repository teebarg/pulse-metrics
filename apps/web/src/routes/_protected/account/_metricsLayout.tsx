import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "~/components/metrics/Header";
import { useNotifications } from "~/hooks/useNotifications";
import { useWebSocket } from "pulsews";
import { getOrgEventsFn } from "~/server-fn/event.fn";
import { useSuspenseQuery } from "@tanstack/react-query";
import { store, updateState } from "~/utils/store";
import { useStore } from "@tanstack/react-store";
import { getSettingsFn } from "~/server-fn/settings.fn";

const orgEventsQueryOptions = () => ({
    queryKey: ["organization", "events"],
    queryFn: () => getOrgEventsFn(),
});

const settingsQueryOptions = () => ({
    queryKey: ["settings"],
    queryFn: () => getSettingsFn(),
});

export const Route = createFileRoute("/_protected/account/_metricsLayout")({
    loader: async ({ context: { queryClient } }) => {
        await queryClient.ensureQueryData(orgEventsQueryOptions());
        await queryClient.ensureQueryData(settingsQueryOptions());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data } = useSuspenseQuery(orgEventsQueryOptions());
    const { data: settingsData } = useSuspenseQuery(settingsQueryOptions());
    const events = useStore(store, (state) => state.events);
    const { notifications, processEvent, markAsRead, markAllAsRead, dismissNotification } = useNotifications(settingsData.settings);
    const { lastMessage, send } = useWebSocket();

    useEffect(() => {
        send(JSON.stringify({ type: "subscribe", tables: ["events"], filters: { id: data.organizationId } }));
    }, [data.organizationId]);

    useEffect(() => {
        updateState(data.events);
    }, [processEvent, data]);

    useEffect(() => {
        if (lastMessage?.action == "INSERT" && lastMessage?.table == "events") {
            const updated = [lastMessage.data, ...events.slice(0, 499)];
            processEvent(lastMessage.data, updated);
            updateState(updated);
        }
    }, [lastMessage]);

    return (
        <div className="min-h-screen bg-background">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-event-purchase/5 rounded-full blur-3xl" />
            </div>

            <Header
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDismissNotification={dismissNotification}
                settings={settingsData.settings}
            />

            <div className="border-b border-border bg-card/30">
                <div className="container mx-auto px-6">
                    <nav className="flex gap-1">
                        <Link
                            to="/account"
                            className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent"
                            activeProps={{ className: "text-primary border-primary" }}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/account/products"
                            className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent"
                            activeProps={{ className: "text-primary border-primary" }}
                        >
                            Products
                        </Link>
                    </nav>
                </div>
            </div>
            <Outlet />
        </div>
    );
}
