import { createFileRoute, redirect } from "@tanstack/react-router";
import OnboardingFlow from "~/components/OnboardingFlow";
import { getOnboardingStatusFn } from "~/server-fn/onboarding.fn";

const galleryInfiniteQueryOptions = (limit: number) => ({
    queryKey: ["gallery", JSON.stringify({ limit })],
    queryFn: () => getGalleryImagesFn({ data: { limit } }),
});

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
