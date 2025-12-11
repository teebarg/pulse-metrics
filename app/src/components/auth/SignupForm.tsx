import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { authClient } from "~/lib/auth-client";

const signupFormSchema = z.object({
    fullName: z.string().min(1, "Please enter your full name"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export function SignupForm() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            email: "",
            password: "",
            fullName: "",
        },
    });

    const onSubmit = async (signUpData: SignupFormData) => {
        toast.loading("Creating your account...", { id: "signup" });
        const { data, error } = await authClient.signUp.email(
            {
                email: signUpData.email,
                password: signUpData.password,
                name: signUpData.fullName,
                callbackURL: "/account", // A URL to redirect to after the user verifies their email (optional)
            },
            {
                onRequest: (ctx) => {
                    console.log("🚀 ~ file: SignupForm.tsx:48 ~ ctx:", ctx);
                    toast.loading("Creating your account...", { id: "signup" });
                },
                onSuccess: (ctx) => {
                    console.log("🚀 ~ file: SignupForm.tsx:51 ~ ctx:", ctx);
                    //redirect to the dashboard or sign in page
                },
                onError: (ctx) => {
                    // display the error message
                    toast.error(ctx.error.message);
                },
            }
        );
        console.log("🚀 ~ file: SignupForm.tsx:40 ~ data:", data);
        console.log("🚀 ~ file: SignupForm.tsx:40 ~ error:", error);
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        autoComplete="name"
                        disabled={isSubmitting}
                        {...register("fullName")}
                    />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        {...register("password")}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
            </form>
        </div>
    );
}
