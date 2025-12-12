import { createFileRoute, Outlet } from "@tanstack/react-router";
import { unAuthMiddleware } from "~/middleware/un-auth";

export const Route = createFileRoute("/_auth")({
    component: RouteComponent,
    server: {
        middleware: [unAuthMiddleware],
    },
});

function RouteComponent() {
    return <Outlet />;
}
