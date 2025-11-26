import React, { useEffect, useState } from "react";
import { Check, ChevronRight, ChevronLeft, Rocket, Store, Key, BarChart3, Zap, Copy, ExternalLink } from "lucide-react";
import { Route, useNavigate } from "@tanstack/react-router";
import { getOnboardingStatusFn, updateOnboardingStepFn } from "~/lib/onboarding-server";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrganizationFn } from "~/lib/organizations-server";
import { IntegrationStep } from "./onboarding/IntegrationStep";
import { VerifyStep } from "./onboarding/VerifyStep";
import { StoreInfoStep } from "./onboarding/StoreInfoStep";
import { CompleteStep } from "./onboarding/CompleteStep";
import { WelcomeStep } from "./onboarding/WelcomeStep";

const STEPS = [
    { id: "welcome", title: "Welcome", icon: Rocket },
    { id: "store", title: "Store Info", icon: Store },
    { id: "integration", title: "Integration", icon: Key },
    { id: "verify", title: "Verify", icon: BarChart3 },
    { id: "complete", title: "Complete", icon: Zap },
];

export default function OnboardingFlow({ onboardingStep }: { onboardingStep: number }) {
    const [currentStep, setCurrentStep] = useState(onboardingStep);
    const [formData, setFormData] = useState({
        store: "",
        domain: "",
        platform: "",
        apiKey: "",
        eventsReceived: 0,
    });
    const navigate = useNavigate();
    const [direction, setDirection] = useState<"forward" | "backward">("forward");
    const [isTransitioning, setIsTransitioning] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);
    ``;
    const queryClient = useQueryClient();

    const { data } = useQuery({
        queryKey: ["organization"],
        queryFn: () => getOrganizationFn(),
    });

    useEffect(() => {
        if (data?.organization) {
            setFormData({
                store: data.organization.name || "",
                domain: data.organization?.domain || "",
                platform: data.organization?.platform || "",
                apiKey: data.organization.apiKey || "",
                eventsReceived: data.organization.eventsReceived || 0,
            });
            setCurrentStep(data.organization.onboardingStep!);
        }
    }, [data]);

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            const nextStep = currentStep + 1;
            setDirection("forward");
            setIsTransitioning(true);

            try {
                await updateOnboardingStepFn({
                    data: { step: nextStep, ...formData, name: formData.store },
                });
                queryClient.invalidateQueries({ queryKey: ["organization"] });
            } catch (error) {
                console.error("Failed to save onboarding step:", error);
                toast.error("Failed to save progress");
            }

            setTimeout(() => {
                setCurrentStep(nextStep);
                setIsTransitioning(false);
            }, 150);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        setCurrentStep(STEPS.length - 1);
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <React.Fragment key={step.id}>
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                isCompleted ? "bg-green-500" : isActive ? "bg-blue-500 ring-4 ring-blue-500/30" : "bg-slate-700"
                                            }`}
                                        >
                                            {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                        </div>
                                        <span className={`text-sm mt-2 ${isActive ? "text-white font-medium" : "text-slate-400"}`}>{step.title}</span>
                                    </div>
                                    {index < STEPS.length - 1 && (
                                        <div
                                            className={`h-1 flex-1 mx-2 transition-all duration-300 ${isCompleted ? "bg-green-500" : "bg-slate-700"}`}
                                            style={{ marginTop: "-20px" }}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8 min-h-[500px] backdrop-blur-sm">
                    {currentStep === 0 && <WelcomeStep onNext={handleNext} />}
                    {currentStep === 1 && <StoreInfoStep formData={formData} setFormData={setFormData} onNext={handleNext} onPrev={handlePrev} />}
                    {currentStep === 2 && <IntegrationStep formData={formData} onNext={handleNext} onPrev={handlePrev} />}
                    {currentStep === 3 && <VerifyStep formData={formData} onPrev={handlePrev} onSkip={handleSkip} />}
                    {currentStep === 4 && <CompleteStep formData={formData} />}
                </div>
            </div>
        </div>
    );
}
