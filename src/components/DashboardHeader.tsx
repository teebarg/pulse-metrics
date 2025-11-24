import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { logoutFn } from "~/lib/auth-server";
import { toast } from "sonner";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { CurrentUserAvatar } from "./CurrentUserAvatar";

export function DashboardHeader() {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutFn();
            toast.success("Signed out");
            navigate({ to: "/" });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to sign out";
            toast.error(message);
        } finally {
            setIsLoggingOut(false);
        }
    };
    return (
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex items-center justify-between px-4 md:px-6 gap-4">
            <SidebarTrigger />

            <div className="flex items-center gap-4">
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <CurrentUserAvatar />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate({ to: "/account/settings" })}>Settings</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                            {isLoggingOut ? "Signing out..." : "Log out"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
