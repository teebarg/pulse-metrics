import { useState } from "react";
import { Check, ChevronLeft, BarChart3, Zap } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function VerifyStep({
    formData,
    onPrev,
    onSkip,
}: {
    formData: any;
    onPrev: () => void;
    onSkip: () => void;
}) {
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();
    const hasEvents = formData.eventsReceived > 0;

    const handleNext = () => {
        // TODO
    }

    const simulateVerification = () => {
        setIsVerifying(true);
        let count = 0;
        const interval = setInterval(() => {
            count += Math.floor(Math.random() * 3) + 1;
            if (count >= 5) {
                clearInterval(interval);
                setIsVerifying(false);
                setTimeout(() => handleNext(), 1000);
            }
        }, 800);
    };

    return (
        <div className="max-w-2xl mx-auto py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Let's verify your installation</h2>
            <p className="text-slate-400 mb-8">We'll check if events are being received from your store</p>

            <div className="bg-slate-900 rounded-2xl p-12 mb-8 border border-slate-700">
                {!isVerifying && !hasEvents && (
                    <div>
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="w-12 h-12 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Ready to test?</h3>
                        <p className="text-slate-400 mb-6">Click verify and then visit your store to generate some events</p>
                        <button
                            onClick={simulateVerification}
                            className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            Start Verification
                        </button>
                    </div>
                )}

                {isVerifying && !hasEvents && (
                    <div>
                        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <BarChart3 className="w-12 h-12 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Listening for events...</h3>
                        <p className="text-slate-400 mb-4">Visit your store and click around. We'll detect events automatically.</p>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                    </div>
                )}

                {hasEvents && (
                    <div className="animate-fadeIn">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-12 h-12 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-green-400">Events Detected! 🎉</h3>
                        <p className="text-slate-300 mb-4">
                            We've received <span className="text-2xl font-bold text-green-400">{formData.eventsReceived}</span> events from your store
                        </p>
                        <p className="text-sm text-slate-400">Your tracking is working perfectly!</p>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onPrev}
                    className="flex-1 px-6 py-3 border border-slate-700 rounded-lg hover:bg-slate-700 transition inline-flex items-center justify-center gap-2"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>
                <button onClick={onSkip} className="flex-1 px-6 py-3 border border-slate-700 rounded-lg hover:bg-slate-700 transition">
                    Skip for Now
                </button>
            </div>
        </div>
    );
}
