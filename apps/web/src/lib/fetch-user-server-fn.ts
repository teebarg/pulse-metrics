import { createServerFn } from "@tanstack/react-start";
import { authClient } from "./auth-client";

export const fetchUser: () => Promise<any | null> = createServerFn({
    method: "GET",
}).handler(async () => {
    const { data, error } = await authClient.getSession();

    if (error) {
        return null;
    }

    return data?.user;
});
