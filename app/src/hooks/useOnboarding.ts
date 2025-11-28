import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getSupabaseClient } from "~/lib/supabase/supabase-client";

interface OnboardingStatus {
    onboarding_completed: boolean;
    store_name?: string;
    platform?: string;
    api_key?: string;
}

export function useOnboarding() {
    const supabase = getSupabaseClient();
    const [status, setStatus] = useState<OnboardingStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                navigate({ to: "/auth" });
                return;
            }

            const response = await fetch("/api/onboarding/status", {
                headers: {
                    Authorization: `Bearer ${user.id}`,
                },
            });

            const data = await response.json();
            setStatus(data);

            // Redirect to onboarding if not completed
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
