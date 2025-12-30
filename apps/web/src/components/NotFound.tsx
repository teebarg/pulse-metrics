import { Home, ArrowLeft, Package } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export function NotFound({ children }: { children?: any }) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
            <div className="max-w-md w-full text-center animate-fade-in">
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto relative animate-float">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <Package className="w-20 h-20 text-muted-foreground/40" strokeWidth={1.5} />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-3xl font-bold text-primary/20">?</div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-dashed border-muted-foreground/10 animate-pulse-soft" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-muted-foreground/5" />
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Error 404
                </div>

                <div className="space-y-4 mb-8">
                    <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
                    <div className="text-muted-foreground leading-relaxed">{children || <p>The page you are looking for does not exist.</p>}</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <Button
                        onClick={() => {
                            navigate({ to: "/" });
                        }}
                        className="gap-2 px-6 py-5 text-base font-medium"
                    >
                        <Home className="w-4 h-4" />
                        Go to Homepage
                    </Button>
                    <Button
                        variant="outline"
                        onClick={(e) => {
                            e.preventDefault();
                            window.history.back();
                        }}
                        className="gap-2 px-6 py-5 text-base font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
