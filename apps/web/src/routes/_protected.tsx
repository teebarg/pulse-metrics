import { createFileRoute, Outlet } from "@tanstack/react-router";
// import { authMiddleware } from "~/middleware/auth";

export const Route = createFileRoute("/_protected")({
    component: ProtectedLayoutComponent,
    // server: {
    //     middleware: [authMiddleware],
    // },
});

function ProtectedLayoutComponent() {
    return <Outlet />;
}
