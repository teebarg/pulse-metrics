import { useState } from "react";
import { Settings, Volume2, VolumeX, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface NotificationThresholds {
    highValueThreshold: number;
    activitySpikeMultiplier: number;
}

interface NotificationSettingsProps {
    soundEnabled: boolean;
    onToggleSound: () => void;
    browserNotificationsEnabled: boolean;
    onToggleBrowserNotifications: () => void;
    thresholds: NotificationThresholds;
    onThresholdsChange: (thresholds: NotificationThresholds) => void;
}

export function NotificationSettings({
    soundEnabled,
    onToggleSound,
    browserNotificationsEnabled,
    onToggleBrowserNotifications,
    thresholds,
    onThresholdsChange,
}: NotificationSettingsProps) {
    const [open, setOpen] = useState(false);
    const [localThresholds, setLocalThresholds] = useState(thresholds);

    const handleHighValueChange = (value: number[]) => {
        const newThresholds = { ...localThresholds, highValueThreshold: value[0] };
        setLocalThresholds(newThresholds);
        onThresholdsChange(newThresholds);
    };

    const handleSpikeMultiplierChange = (value: number[]) => {
        const newThresholds = { ...localThresholds, activitySpikeMultiplier: value[0] };
        setLocalThresholds(newThresholds);
        onThresholdsChange(newThresholds);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Notification Settings</DialogTitle>
                    <DialogDescription className="text-muted-foreground">Customize alert thresholds and notification preferences</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {soundEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                            <div>
                                <Label htmlFor="sound-toggle" className="text-foreground">
                                    Sound Effects
                                </Label>
                                <p className="text-xs text-muted-foreground">Play sounds for alerts</p>
                            </div>
                        </div>
                        <Switch id="sound-toggle" checked={soundEnabled} onCheckedChange={onToggleSound} />
                    </div>

                    {/* Browser Notifications Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {browserNotificationsEnabled ? (
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
                        <Switch id="browser-toggle" checked={browserNotificationsEnabled} onCheckedChange={onToggleBrowserNotifications} />
                    </div>

                    <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-medium text-foreground mb-4">Alert Thresholds</h4>

                        {/* High Value Purchase Threshold */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-foreground">High-Value Purchase</Label>
                                <span className="text-sm font-medium text-primary">${localThresholds.highValueThreshold}</span>
                            </div>
                            <Slider
                                value={[localThresholds.highValueThreshold]}
                                onValueChange={handleHighValueChange}
                                min={100}
                                max={1000}
                                step={50}
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">Alert when orders exceed this amount</p>
                        </div>

                        {/* Activity Spike Multiplier */}
                        <div className="space-y-3 mt-6">
                            <div className="flex items-center justify-between">
                                <Label className="text-foreground">Activity Spike Sensitivity</Label>
                                <span className="text-sm font-medium text-primary">{localThresholds.activitySpikeMultiplier}x</span>
                            </div>
                            <Slider
                                value={[localThresholds.activitySpikeMultiplier]}
                                onValueChange={handleSpikeMultiplierChange}
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
