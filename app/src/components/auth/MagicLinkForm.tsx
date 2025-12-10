import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useLocation } from "@tanstack/react-router";
import { authClient } from "~/lib/auth-client";

const magicLinkSchema = z.object({
    email: z.email(),
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

export function MagicLinkForm() {
    const location = useLocation();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<MagicLinkFormData>({
        resolver: zodResolver(magicLinkSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (formData: MagicLinkFormData) => {
        const { data, error } = await authClient.signIn.magicLink({
            email: formData.email,
            callbackURL: location.pathname,
            newUserCallbackURL: "/onboarding",
            errorCallbackURL: "/error",
        });
        console.log("🚀 ~ file: MagicLinkForm.tsx:36 ~ data:", data);
        console.log("🚀 ~ file: MagicLinkForm.tsx:36 ~ error:", error);
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center mb-4">Enter your email and we'll send you a magic link to sign in instantly.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                        id="magic-email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending link..." : "Send Magic Link"}
                </Button>
            </form>
        </div>
    );
}
