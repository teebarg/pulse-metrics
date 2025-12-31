import { useEffect } from "react";
import { Check, BarChart3, Zap, Activity, ChevronLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRealtimeVerification } from "~/hooks/useRealtimeVerification";
import { Button } from "~/components/ui/button";
import { updateOnboardingStepFn } from "~/server-fn/onboarding.fn";

export function VerifyStep({ formData, onPrev }: { formData: any; onPrev: () => void }) {
    const { isVerifying, eventsReceived, isVerified, startVerification, stopVerification } = useRealtimeVerification(formData.eventsReceived ?? 0);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isVerified) {
            setTimeout(() => {
                handleNext();
            }, 1500);
        }
    }, [isVerified]);

    const handleNext = async () => {
        try {
            await updateOnboardingStepFn({
                data: { step: 4, onboardingCompleted: true, onboardingCompletedAt: new Date() },
            });
            queryClient.invalidateQueries({ queryKey: ["organization"] });
        } catch (error) {
            console.error("Failed to save onboarding step:", error);
            toast.error("Failed to save progress");
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Let's verify your installation</h2>
            <p className="text-slate-400 mb-8">Visit your store and click around. We'll detect events in real-time.</p>
            <div className="bg-slate-900 rounded-2xl p-12 mb-8 border border-slate-700">
                {!isVerifying && !isVerified && (
                    <div>
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="w-12 h-12 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">Ready to test?</h3>
                        <p className="text-slate-400 mb-6">Click verify and then visit your store to generate some events</p>
                        <button
                            onClick={startVerification}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition"
                        >
                            <Zap className="w-5 h-5" />
                            Start Verification
                        </button>
                    </div>
                )}

                {isVerifying && !isVerified && (
                    <div>
                        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <Activity className="w-12 h-12 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Listening for events...</h3>
                        <p className="text-slate-400 mb-4">Visit your store and click around. We'll detect events automatically.</p>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                        <div className="mb-6 mt-4">
                            <div className="text-6xl font-bold text-blue-400 mb-2">{eventsReceived}</div>
                            <p className="text-slate-400">
                                {eventsReceived === 0 ? "Waiting for first event..." : `${5 - eventsReceived} more events needed`}
                            </p>
                        </div>

                        <div className="w-full bg-slate-800 rounded-full h-3 mb-4">
                            <div
                                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((eventsReceived / 5) * 100, 100)}%` }}
                            />
                        </div>

                        {/* Recent events list */}
                        {/* {recentEvents.length > 0 && (
                            <div className="text-left bg-slate-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                                <p className="text-sm text-slate-400 mb-2">Recent events:</p>
                                <div className="space-y-2">
                                    {recentEvents.map((event, i) => (
                                        <div key={i} className="text-sm text-green-400 animate-fadeIn flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            {formatEventType(event.eventType)}
                                            <span className="text-slate-500 text-xs">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}

                        <Button variant="destructive" onClick={stopVerification} className="mt-6">
                            Stop listening
                        </Button>
                    </div>
                )}

                {isVerified && (
                    <div className="animate-fadeIn">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-12 h-12 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-green-400 mb-4">Events Detected! 🎉</h3>
                        <p className="text-slate-300 mb-4">
                            We've received <span className="text-2xl font-bold text-green-400">{eventsReceived}</span> events from your store
                        </p>
                        <p className="text-sm text-slate-400">Your tracking is working perfectly!</p>
                    </div>
                )}
            </div>

            {isVerifying && !isVerified && (
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
                    <p className="text-blue-400 text-sm font-medium mb-2">💡 What to do:</p>
                    <ol className="text-left text-sm text-slate-300 space-y-1">
                        <li>1. Open your store in a new tab</li>
                        <li>2. Click on a few products</li>
                        <li>3. Add something to cart</li>
                        <li>4. Events will appear here automatically</li>
                    </ol>
                </div>
            )}

            <div className="flex gap-4">
                <button
                    onClick={onPrev}
                    className="flex-1 px-6 py-3 border border-slate-700 rounded-lg hover:bg-slate-700 transition inline-flex items-center justify-center gap-2"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>
                <button onClick={handleNext} className="flex-1 px-6 py-3 border border-slate-700 rounded-lg hover:bg-slate-700 transition text-white">
                    Skip for Now
                </button>
                {isVerified && (
                    <button
                        onClick={handleNext}
                        className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg transition text-white font-semibold"
                    >
                        Continue →
                    </button>
                )}
            </div>
        </div>
    );
}
