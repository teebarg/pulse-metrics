import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { fetchUser } from "~/lib/fetch-user-server-fn";
import { getOnboardingStatusFn } from "~/lib/onboarding-server";

export const Route = createFileRoute("/auth")({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        const user = await fetchUser();
        if (user) {
            const { onboardingCompleted } = await getOnboardingStatusFn();
            if (!onboardingCompleted) {
                throw redirect({ to: "/onboarding" });
            }
            throw redirect({ to: "/account" });
        }
    },
});

function RouteComponent() {
    return <Outlet />;
}
