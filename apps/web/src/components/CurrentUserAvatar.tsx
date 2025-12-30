import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { createAuthClient } from "better-auth/react";
const { useSession } = createAuthClient();

export const CurrentUserAvatar = () => {
    const { data: session } = useSession();
    const initials = session?.user?.name
        ?.split(" ")
        ?.map((word: string) => word[0])
        ?.join("")
        ?.toUpperCase();

    return (
        <Avatar>
            {session?.user?.image && <AvatarImage src={session?.user?.image} alt={initials} />}
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
    );
};
