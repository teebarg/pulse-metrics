import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { BarChart3, Zap, Shield, TrendingUp, Code, Check, Sparkles, Pencil } from "lucide-react";
import Pricing from "~/components/landing/Pricing";
import { authClient } from "~/lib/auth-client";
import { currency } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { ThemeToggle } from "~/components/theme-toggle";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function RouteComponent() {
    const search: { callbackUrl?: string } = useSearch({ strict: false });
    const { data: session, isPending } = authClient.useSession();
    const isAuthenticated = !!session;
    const navigate = useNavigate();

    const hasRun = useRef(false);

    useEffect(() => {
        if (isAuthenticated || isPending || hasRun.current) return;

        hasRun.current = true;
        authClient.oneTap({
            callbackURL: search?.callbackUrl || "/account",
        });
    }, [isAuthenticated]);

    const handleGetStarted = () => {
        navigate({ to: "/auth" });
    };

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate({ to: "/auth" });
                },
            },
        });
    };

    return (
        <div className="min-h-screen">
            <header className="border-b border-muted">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-8 h-8 text-blue-400" />
                            <span className="text-2xl font-bold">PulseMetrics</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            {isPending ? (
                                <div className="flex gap-2">
                                    <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
                                    <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
                                </div>
                            ) : isAuthenticated ? (
                                <>
                                    <Button variant="ghost" onClick={handleSignOut}>
                                        Sign Out
                                    </Button>
                                    <Button onClick={() => navigate({ to: "/account" })}>Dashboard</Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" onClick={handleGetStarted}>
                                        Sign In
                                    </Button>
                                    <Button className="animate-scale-in cursor-pointer" onClick={handleGetStarted}>
                                        Get Started
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Real-Time Analytics for
                        <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">Modern E-Commerce</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                        Get instant insights into your store's performance. Track visitors, sales, and conversions in real-time. Install in under 60
                        seconds.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => navigate({ to: "/account" })} size="xl" className="rounded-lg">
                            Start Free Trial
                        </Button>
                        <Button size="xl" variant="outline" className="rounded-lg">
                            View Demo
                        </Button>
                    </div>

                    <div className="mt-12 flex gap-8 justify-center items-center text-sm text-muted-foreground">
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
                <div className="mt-16 rounded-2xl border border-muted bg-secondary p-8 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <MetricCard title="Active Visitors" value="127" change="+12%" positive />
                        <MetricCard title="Today's Sales" value={currency(2847)} change="+23%" positive />
                        <MetricCard title="Conversion Rate" value="3.2%" change="+0.4%" positive />
                    </div>
                    <div className="bg-card rounded-lg p-6 h-64 flex items-center justify-center">
                        <div className="text-muted-foreground">
                            <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-center">Real-time sales chart would go here</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-secondary py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <Badge variant="contrast" className="mb-4">
                            <BarChart3 className="h-3 w-3 mr-2" />
                            Growth Assured
                        </Badge>
                        <h2 className="text-4xl font-bold mb-4">Everything You Need to Grow</h2>
                        <p className="text-xl text-muted-foreground">Powerful analytics made simple</p>
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

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <Badge variant="contrast" className="mb-4">
                            <Sparkles className="h-3 w-3 mr-2" />
                            Works With Your Stack
                        </Badge>
                        <h2 className="text-4xl font-bold mb-4">Works With Your Stack</h2>
                        <p className="text-xl text-muted-foreground">Integrate in minutes, not hours</p>
                    </div>

                    <div className="bg-secondary rounded-2xl p-8 max-w-3xl mx-auto border border-muted">
                        <div className="mb-4">
                            <span className="text-sm">JavaScript SDK</span>
                        </div>
                        <pre className="bg-slate-800 rounded-lg p-6 overflow-x-auto">
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
                        <p className="text-sm text-muted-foreground mt-4 text-center">That's it! You're now tracking visitors and sales.</p>
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

            <Pricing />

            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Badge variant="contrast" className="mb-4">
                        <Pencil className="h-3 w-3 mr-2" />
                        Get Started
                    </Badge>
                    <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
                    <p className="text-xl text-muted-foreground mb-8">Join hundreds of e-commerce stores already using PulseMetrics</p>
                    <Button
                        size="xl"
                        onClick={() => navigate({ to: "/account" })}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-12 shadow-lg shadow-blue-500/50"
                    >
                        Start Your Free Trial
                    </Button>
                </div>
            </section>
            <footer className="border-t border-muted py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-blue-400" />
                            <span className="text-lg font-bold">PulseMetrics</span>
                        </div>
                        <div className="text-sm text-muted-foreground">© 2024 PulseMetrics. All rights reserved.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function MetricCard({ title, value, change, positive }: any) {
    return (
        <div className="bg-card rounded-lg p-6 border border-muted">
            <div className="text-sm text-muted-foreground mb-2">{title}</div>
            <div className="text-3xl font-bold mb-2">{value}</div>
            <div className={`text-sm ${positive ? "text-green-400" : "text-red-400"}`}>{change}</div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: any) {
    return (
        <div className="bg-card rounded-lg p-6 border">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

function PlatformBadge({ name }: any) {
    return <div className="bg-slate-800 border border-slate-700 rounded-lg px-6 py-3 text-white font-medium">{name}</div>;
}
