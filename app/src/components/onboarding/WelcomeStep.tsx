import React from "react";
import { ChevronRight, Rocket, Key, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";


export function WelcomeStep({ onNext }: { onNext: () => void }) {
    return (
        <div className="text-center py-12">
            <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to PulseMetrics!</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Get real-time analytics for your e-commerce store in just 3 minutes. Track visitors, sales, and conversions instantly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                <FeatureCard icon={<Zap className="w-6 h-6 text-yellow-400" />} title="Real-Time" description="See what's happening right now" />
                <FeatureCard
                    icon={<BarChart3 className="w-6 h-6 text-blue-400" />}
                    title="Beautiful Dashboards"
                    description="Intuitive and easy to understand"
                />
                <FeatureCard icon={<Key className="w-6 h-6 text-green-400" />} title="Easy Setup" description="One line of code to get started" />
            </div>

            <Button onClick={onNext} className="gap-2" size="lg">
                Get Started
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
            <div className="mb-3">{icon}</div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-slate-400">{description}</p>
        </div>
    );
}
