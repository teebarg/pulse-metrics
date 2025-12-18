import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, LogOut, Key, EyeOffIcon, EyeIcon } from "lucide-react";
import { useState } from "react";
import { authClient } from "~/lib/auth-client";
import { getOrganizationFn } from "~/server-fn/organization.fn";
import { useSuspenseQuery } from "@tanstack/react-query";

const organizationQueryOptions = () => ({
    queryKey: ["organization"],
    queryFn: () => getOrganizationFn(),
});

export const Route = createFileRoute("/_protected/account/settings")({
    loader: async ({ context: { queryClient } }) => {
        const data = await queryClient.ensureQueryData(organizationQueryOptions());

        return {
            data,
        };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const { data } = useSuspenseQuery(organizationQueryOptions());
    const [showApiKey, setShowApiKey] = useState(false);

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate({ to: "/" });
                },
            },
        });
    };

    return (
        <div className="max-w-3xl space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account and AI preferences</p>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Profile</h2>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data?.name || ""} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input id="domain" readOnly value={data?.domain || ""} />
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Key className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">API Keys</h2>
                </div>
                <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="api-key">Your API Key</Label>
                    <div className="flex gap-2 items-center">
                        <Input
                            id="api-key"
                            type={showApiKey ? "text" : "password"}
                            placeholder="sk-••••••••••••••••"
                            className="flex-1"
                            value={data.apiKey}
                            disabled={true}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowApiKey((v) => !v)}
                            tabIndex={-1}
                            aria-label={showApiKey ? "Hide API key" : "Show API key"}
                        >
                            {showApiKey ? <EyeOffIcon /> : <EyeIcon />}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Your API key is encrypted and stored securely</p>
                </div>
            </Card>

            <Separator />

            <Card className="p-6 border-destructive/50">
                <div className="flex items-center gap-2 mb-4">
                    <LogOut className="h-5 w-5 text-destructive" />
                    <h2 className="text-xl font-semibold">Account Actions</h2>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                    Log Out
                </Button>
            </Card>
        </div>
    );
}
