import { useState } from "react";
import { ChevronLeft, ChevronRight, Copy, ExternalLink, Key, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";

export function IntegrationStep({ formData, onNext, onPrev }: { formData: any; onNext: () => void; onPrev: () => void }) {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const installCode = `<script src="${import.meta.env.VITE_SDK_CDN}"></script>
<script>
PulseMetrics.init({
    apiKey: '${formData.apiKey}'
});
</script>`;

    const npmCode = `npm install @pulsemetrics/sdk

import PulseMetrics from '@pulsemetrics/sdk';
PulseMetrics.init({ apiKey: '${formData.apiKey}' });`;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-bold mb-2">Install PulseMetrics</h2>
            <p className="text-slate-400 mb-8">Add this code to your website to start tracking</p>

            {/* API Key Display */}
            <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Your API Key</span>
                    <button
                        onClick={() => copyToClipboard(formData.apiKey)}
                        className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                    >
                        <Copy className="w-4 h-4" />
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
                <code className="text-green-400 font-mono">{formData.apiKey}</code>
            </div>

            {/* Installation Methods */}
            <div className="space-y-6">
                {formData.platform === "shopify" ? (
                    <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-400" />
                            Automatic Installation (Recommended)
                        </h3>
                        <p className="text-slate-300 mb-4">Install our Shopify app for one-click setup</p>
                        <button className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg inline-flex items-center gap-2">
                            Install Shopify App
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        <div>
                            <h3 className="font-semibold mb-3">Option 1: Script Tag (Easiest)</h3>
                            <p className="text-sm text-slate-400 mb-3">
                                Add this code to your website's <code className="text-blue-400">&lt;head&gt;</code> section:
                            </p>
                            <CodeBlock code={installCode} />
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Option 2: NPM Package</h3>
                            <p className="text-sm text-slate-400 mb-3">For React, Vue, or other modern frameworks:</p>
                            <CodeBlock code={npmCode} />
                        </div>
                    </>
                )}
            </div>

            <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4 text-yellow-400" />
                    Need Help?
                </h4>
                <p className="text-sm text-slate-400 mb-3">Check out our detailed installation guides:</p>
                <div className="flex gap-2">
                    <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
                        Documentation →
                    </a>
                    <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
                        Video Tutorial →
                    </a>
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
                <Button onClick={onNext} className="flex-1 px-6 py-3 gap-2 h-auto">
                    I've Added the Code
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}

function CodeBlock({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="relative bg-slate-900 rounded-lg p-4 border border-slate-700">
            <button
                onClick={() => copyToClipboard(code)}
                className="absolute top-3 right-3 text-sm text-slate-400 hover:text-white inline-flex items-center gap-1"
            >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
            </button>
            <pre className="text-sm overflow-x-auto">
                <code className="text-green-400">{code}</code>
            </pre>
        </div>
    );
}
