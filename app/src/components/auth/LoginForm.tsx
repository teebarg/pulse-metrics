import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "~/lib/auth-client";
import z from "zod";

interface LoginFormProps {
    isLoading: boolean;
}

type LoginFormData = {
    email: string;
    password: string;
};

export function LoginForm({ isLoading }: LoginFormProps) {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<LoginFormData>({
        resolver: zodResolver(
            z.object({
                email: z.email(),
                password: z.string().min(6, "Password must be at least 6 characters"),
            })
        ),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (loginData: LoginFormData) => {
        toast.loading("Signing in...", { id: "login" });
        const { data, error } = await authClient.signIn.email(
            {
                email: loginData.email,
                password: loginData.password,
                callbackURL: "/account",
                rememberMe: true,
            },
            {
                onRequest: (ctx) => {
                    console.log("🚀 ~ file: SignupForm.tsx:48 ~ ctx:", ctx);
                    toast.loading("Creating your account...", { id: "login" });
                },
                onSuccess: async (ctx) => {
                    console.log("🚀 ~ file: SignupForm.tsx:51 ~ ctx:", ctx);
                    const { getOnboardingStatusFn } = await import("~/lib/onboarding-server");
                    //redirect to the dashboard or sign in page
                    try {
                        const status = await getOnboardingStatusFn();
                        setTimeout(() => {
                            if (!status.onboardingCompleted) {
                                navigate({ to: "/onboarding" });
                            } else {
                                navigate({ to: "/account" });
                            }
                        }, 500);
                    } catch {
                        setTimeout(() => {
                            navigate({ to: "/onboarding" });
                        }, 500);
                    }
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message, {
                        id: "login",
                    });
                },
            }
        );
        console.log("🚀 ~ file: LoginForm.tsx:40 ~ data:", data);
        console.log("🚀 ~ file: LoginForm.tsx:40 ~ error:", error);
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isSubmitting || isLoading}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isSubmitting || isLoading}
                        {...register("password")}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
            </form>
        </div>
    );
}
