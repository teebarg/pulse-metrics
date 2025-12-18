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
import { CurrentUserAvatar } from "./CurrentUserAvatar";
import { authClient } from "~/lib/auth-client";
import { ThemeToggle } from "./theme-toggle";

export function DashboardHeader() {
    const navigate = useNavigate();

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
                        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
