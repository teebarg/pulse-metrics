import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Brain, CheckCircle2, Clock, ArrowRight, BarChart3, Zap, Shield, TrendingUp, Code, Check } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import Features from "~/components/landing/Features";
import Pricing from "~/components/landing/Pricing";
import Footer from "~/components/Footer";
import TrustedBy from "~/components/landing/TrustedBy";
import { motion } from "framer-motion";
import { fetchUser } from "~/lib/fetch-user-server-fn";

export const Route = createFileRoute("/")({
    component: RouteComponent,
    loader: async () => {
        const user = await fetchUser();
        const isAuthenticated = user !== null;
        return { isAuthenticated };
    },
});

function RouteComponent() {
    const { isAuthenticated } = Route.useLoaderData();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate({ to: "/auth" });
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900">
            <header className="border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-8 h-8 text-blue-400" />
                            <span className="text-2xl font-bold text-white">PulseMetrics</span>
                        </div>
                        {isAuthenticated ? (
                            <Button onClick={() => navigate({ to: "/account" })}>Dashboard</Button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={handleGetStarted}>
                                    Sign In
                                </Button>
                                <Button className="animate-scale-in cursor-pointer" onClick={handleGetStarted}>
                                    Get Started
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Real-Time Analytics for
                        <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">Modern E-Commerce</span>
                    </h1>
                    <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
                        Get instant insights into your store's performance. Track visitors, sales, and conversions in real-time. Install in under 60
                        seconds.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg shadow-blue-500/50">
                            Start Free Trial
                        </button>
                        <button className="border-2 border-slate-600 hover:border-slate-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition">
                            View Demo
                        </button>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-12 flex gap-8 justify-center items-center text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-400" />
                            <span>Free Forever</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-400" />
                            <span>No Credit Card</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-400" />
                            <span>2-Minute Setup</span>
                        </div>
                    </div>
                </div>

                {/* Demo Dashboard Preview */}
                <div className="mt-16 rounded-2xl border border-slate-700 bg-slate-800/50 p-8 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <MetricCard title="Active Visitors" value="127" change="+12%" positive />
                        <MetricCard title="Today's Sales" value="$2,847" change="+23%" positive />
                        <MetricCard title="Conversion Rate" value="3.2%" change="+0.4%" positive />
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-6 h-64 flex items-center justify-center">
                        <div className="text-slate-500">
                            <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-center">Real-time sales chart would go here</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-slate-800/50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Grow</h2>
                        <p className="text-xl text-slate-300">Powerful analytics made simple</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-yellow-400" />}
                            title="Real-Time Updates"
                            description="See what's happening on your store right now. No delays, no waiting."
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-green-400" />}
                            title="Privacy First"
                            description="GDPR compliant. Your data stays secure and private."
                        />
                        <FeatureCard
                            icon={<Code className="w-8 h-8 text-blue-400" />}
                            title="One-Line Setup"
                            description="Add one script tag and you're done. Works with any e-commerce platform."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-purple-400" />}
                            title="Conversion Tracking"
                            description="Track the entire customer journey from landing to purchase."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-8 h-8 text-pink-400" />}
                            title="Product Insights"
                            description="See which products are hot and which need attention."
                        />
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-orange-400" />}
                            title="Smart Alerts"
                            description="Get notified about unusual activity or sales spikes."
                        />
                    </div>
                </div>
            </section>

            {/* Integration Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4">Works With Your Stack</h2>
                        <p className="text-xl text-slate-300">Integrate in minutes, not hours</p>
                    </div>

                    <div className="bg-slate-800/50 rounded-2xl p-8 max-w-3xl mx-auto border border-slate-700">
                        <div className="mb-4">
                            <span className="text-sm text-slate-400">JavaScript SDK</span>
                        </div>
                        <pre className="bg-slate-900 rounded-lg p-6 overflow-x-auto">
                            <code className="text-green-400 text-sm">
                                {`<!-- Add to your <head> -->
<script src="https://cdn.pulsemetrics.io/sdk.js"></script>
<script>
  PulseMetrics.init({
    apiKey: 'your_api_key_here'
  });
</script>`}
                            </code>
                        </pre>
                        <p className="text-sm text-slate-400 mt-4 text-center">That's it! You're now tracking visitors and sales.</p>
                    </div>

                    <div className="mt-12 flex justify-center gap-6 flex-wrap">
                        <PlatformBadge name="Shopify" />
                        <PlatformBadge name="WooCommerce" />
                        <PlatformBadge name="Magento" />
                        <PlatformBadge name="BigCommerce" />
                        <PlatformBadge name="Custom" />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <Pricing />

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
                    <p className="text-xl text-slate-300 mb-8">Join hundreds of e-commerce stores already using PulseMetrics</p>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-12 py-4 rounded-lg font-semibold text-lg transition shadow-lg shadow-blue-500/50">
                        Start Your Free Trial
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-700 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-blue-400" />
                            <span className="text-lg font-bold text-white">PulseMetrics</span>
                        </div>
                        <div className="text-sm text-slate-400">© 2024 PulseMetrics. All rights reserved.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function MetricCard({ title, value, change, positive }: any) {
    return (
        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
            <div className="text-sm text-slate-400 mb-2">{title}</div>
            <div className="text-3xl font-bold text-white mb-2">{value}</div>
            <div className={`text-sm ${positive ? "text-green-400" : "text-red-400"}`}>{change}</div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: any) {
    return (
        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-slate-400">{description}</p>
        </div>
    );
}

function PlatformBadge({ name }: any) {
    return <div className="bg-slate-800 border border-slate-700 rounded-lg px-6 py-3 text-white font-medium">{name}</div>;
}
