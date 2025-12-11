import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
// import { unAuthMiddleware } from "~/middleware/un-auth";
// import { getOnboardingStatusFn } from "~/server-fn/onboarding.fn";

export const Route = createFileRoute("/_auth")({
    component: RouteComponent,
    // server: {
    //     middleware: [unAuthMiddleware],
    // },
    // beforeLoad: async ({ context }) => {
    //     const { onboardingCompleted } = await getOnboardingStatusFn();
    //     if (!onboardingCompleted) {
    //         throw redirect({ to: "/onboarding" });
    //     }
    //     throw redirect({ to: "/account" });
    // },
});

function RouteComponent() {
    return <Outlet />;
}
