import { createFileRoute, redirect } from "@tanstack/react-router";
import { getOnboardingStatusFn } from "~/lib/onboarding-server";
import OnboardingFlow from "~/components/OnboardingFlow";

export const Route = createFileRoute("/_protected/onboarding")({
    component: RouteComponent,
    loader: async ({ context }) => {
        const { onboardingCompleted, onboardingStep } = await getOnboardingStatusFn();
        if (onboardingCompleted) {
            throw redirect({ to: "/account" });
        }
        return {
            onboardingStep,
        };
    },
});

function RouteComponent() {
    return (
        <div className="min-h-screen">
            <OnboardingFlow />
        </div>
    );
}
