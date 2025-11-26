import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StoreInfoStep({
    formData,
    setFormData,
    onNext,
    onPrev,
}: {
    formData: any;
    setFormData: any;
    onNext: () => void;
    onPrev: () => void;
}) {
    const platforms = [
        { id: "shopify", name: "Shopify", logo: "🛍️" },
        { id: "woocommerce", name: "WooCommerce", logo: "🔌" },
        { id: "custom", name: "Custom/Other", logo: "⚡" },
    ];

    const canProceed = formData.store && formData.platform;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-bold mb-2">Tell us about your store</h2>
            <p className="text-slate-400 mb-8">This helps us customize your analytics experience</p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Store Name</label>
                    <input
                        type="text"
                        value={formData.store}
                        onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                        placeholder="My Awesome Store"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Store URL (Optional)</label>
                    <input
                        type="url"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        placeholder="https://mystore.com"
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3">What platform are you using?</label>
                    <div className="grid grid-cols-3 gap-4">
                        {platforms.map((platform) => (
                            <button
                                key={platform.id}
                                onClick={() => setFormData({ ...formData, platform: platform.id })}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    formData.platform === platform.id ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-600"
                                }`}
                            >
                                <div className="text-3xl mb-2">{platform.logo}</div>
                                <div className="font-medium text-sm">{platform.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-12">
                <button
                    onClick={onPrev}
                    className="flex-1 px-6 py-3 border border-slate-700 rounded-lg hover:bg-slate-700 transition inline-flex items-center justify-center gap-2"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                </button>
                <Button onClick={onNext} disabled={!canProceed} className="flex-1 px-6 py-3 disabled:bg-slate-700 gap-2 h-auto">
                    Continue
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
