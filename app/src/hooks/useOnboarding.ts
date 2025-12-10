import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getOnboardingStatusFn } from "~/server-fn/onboarding.fn";
import { createAuthClient } from "better-auth/react";

interface OnboardingStatus {
    onboarding_completed: boolean;
    store_name?: string;
    platform?: string;
    api_key?: string;
}

export function useOnboarding() {
    const [status, setStatus] = useState<OnboardingStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { useSession } = createAuthClient();
    const { data: session } = useSession();

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            if (!session) {
                navigate({ to: "/auth" });
                return;
            }

            const data = await getOnboardingStatusFn();
            setStatus(data);
            if (!data.onboarding_completed && window.location.pathname !== "/onboarding") {
                navigate({ to: "/onboarding" });
            }
        } catch (error) {
            console.error("Failed to check onboarding status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startOnboarding = async () => {
        const response = await fetch("/api/onboarding/start", {
            method: "POST",
        });
        return response.json();
    };

    const completeOnboarding = async (data: { store: string; domain?: string; platform: string }) => {
        const response = await fetch("/api/onboarding/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            await checkOnboardingStatus();
            navigate({ to: "/account" });
        }

        return response.json();
    };

    const verifyTracking = async () => {
        const response = await fetch("/api/onboarding/verify");
        return response.json();
    };

    const skipOnboarding = async () => {
        const response = await fetch("/api/onboarding/skip", {
            method: "POST",
        });

        if (response.ok) {
            await checkOnboardingStatus();
            navigate({ to: "/account" });
        }

        return response.json();
    };

    return {
        status,
        isLoading,
        startOnboarding,
        completeOnboarding,
        verifyTracking,
        skipOnboarding,
    };
}
