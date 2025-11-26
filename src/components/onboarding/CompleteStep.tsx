import React from "react";
import { Check, Rocket, BarChart3, Zap } from "lucide-react";

export function CompleteStep({ formData }: { formData: any }) {
    return (
        <div className="max-w-2xl mx-auto py-8 text-center">
            <div className="w-24 h-24 bg-linear-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12" />
            </div>

            <h2 className="text-3xl font-bold mb-4">You're All Set! 🎉</h2>
            <p className="text-xl text-slate-300 mb-8">{formData.store} is now tracking with PulseMetrics</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <StatCard value={formData.eventsReceived || "0"} label="Events Tracked" icon={<BarChart3 className="w-5 h-5 text-blue-400" />} />
                <StatCard value="Real-time" label="Updates" icon={<Zap className="w-5 h-5 text-yellow-400" />} />
                <StatCard value="100k" label="Free Events/mo" icon={<Rocket className="w-5 h-5 text-green-400" />} />
            </div>

            <div className="space-y-4">
                <a href="/dashboard" className="block bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition">
                    View Your Dashboard
                </a>

                <div className="flex gap-4">
                    <a href="/docs" className="flex-1 px-6 py-3 border border-slate-700 rounded-lg hover:bg-slate-700 transition">
                        Read Documentation
                    </a>
                    <a href="/settings" className="flex-1 px-6 py-3 border border-slate-700 rounded-lg hover:bg-slate-700 transition">
                        Customize Settings
                    </a>
                </div>
            </div>

            <div className="mt-12 p-6 bg-slate-900/50 rounded-lg border border-slate-700 text-left">
                <h4 className="font-semibold mb-3">🚀 Next Steps:</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        Explore your real-time dashboard
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        Set up email alerts for important events
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        Invite team members to collaborate
                    </li>
                    <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                        Customize your tracking with advanced events
                    </li>
                </ul>
            </div>
        </div>
    );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
    return (
        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-center mb-2">{icon}</div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
        </div>
    );
}
