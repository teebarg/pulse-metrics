import { useRef, useState } from "react";
import { Settings as SettingsIcon, Volume2, VolumeX, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { currency } from "~/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Settings, updateSettingsFn } from "~/server-fn/settings.fn";

interface NotificationSettingsProps {
    settings: Settings;
}

export function NotificationSettings({ settings }: NotificationSettingsProps) {
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (input: {
            browserNotificationsEnabled?: boolean;
            soundEnabled?: boolean;
            highValueThreshold?: number;
            activitySpikeMultiplier?: number;
        }) => await updateSettingsFn({ data: input }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
        onError: (error) => {
            toast.error("Failed to update settings" + error);
        },
    });

    const handleFieldUpdate = (
        field: "soundEnabled" | "browserNotificationsEnabled" | "highValueThreshold" | "activitySpikeMultiplier",
        value: boolean | number
    ) => {
        const isNumericField = field === "highValueThreshold" || field === "activitySpikeMultiplier";

        if (isNumericField) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                mutation.mutate(
                    { [field]: value },
                    {
                        onError: (e) => {
                            toast.error("Failed to update settings" + e);
                        },
                    }
                );
            }, 400);

            return;
        }

        mutation.mutate(
            { [field]: value },
            {
                onError: (e) => {
                    toast.error("Failed to update settings" + e);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <SettingsIcon className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Notification Settings</DialogTitle>
                    <DialogDescription className="text-muted-foreground">Customize alert thresholds and notification preferences</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {settings?.soundEnabled ? (
                                <Volume2 className="h-5 w-5 text-primary" />
                            ) : (
                                <VolumeX className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                                <Label htmlFor="sound-toggle" className="text-foreground">
                                    Sound Effects
                                </Label>
                                <p className="text-xs text-muted-foreground">Play sounds for alerts</p>
                            </div>
                        </div>
                        <Switch
                            id="sound-toggle"
                            checked={settings?.soundEnabled}
                            onCheckedChange={(checked: boolean) => handleFieldUpdate("soundEnabled", checked)}
                        />
                    </div>

                    {/* Browser Notifications Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {settings?.browserNotificationsEnabled ? (
                                <Bell className="h-5 w-5 text-primary" />
                            ) : (
                                <BellOff className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                                <Label htmlFor="browser-toggle" className="text-foreground">
                                    Browser Notifications
                                </Label>
                                <p className="text-xs text-muted-foreground">Show desktop notifications</p>
                            </div>
                        </div>
                        <Switch
                            id="browser-toggle"
                            checked={settings?.browserNotificationsEnabled}
                            onCheckedChange={(checked: boolean) => handleFieldUpdate("browserNotificationsEnabled", checked)}
                        />
                    </div>

                    <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-medium text-foreground mb-4">Alert Thresholds</h4>

                        {/* High Value Purchase Threshold */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-foreground">High-Value Purchase</Label>
                                <span className="text-sm font-medium text-primary">{currency(settings?.highValueThreshold)}</span>
                            </div>
                            <Slider
                                value={[settings?.highValueThreshold!]}
                                onValueChange={(value: number[]) => handleFieldUpdate("highValueThreshold", value[0])}
                                min={1000}
                                max={100000}
                                step={500}
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">Alert when orders exceed this amount</p>
                        </div>

                        {/* Activity Spike Multiplier */}
                        <div className="space-y-3 mt-6">
                            <div className="flex items-center justify-between">
                                <Label className="text-foreground">Activity Spike Sensitivity</Label>
                                <span className="text-sm font-medium text-primary">{settings?.activitySpikeMultiplier}x</span>
                            </div>
                            <Slider
                                value={[settings?.activitySpikeMultiplier!]}
                                onValueChange={(value: number[]) => handleFieldUpdate("activitySpikeMultiplier", value[0])}
                                min={1.5}
                                max={5}
                                step={0.5}
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">Alert when activity exceeds this multiplier of normal</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
