import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { auth } from "~/lib/auth-client";

export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        throw redirect({ to: "/auth" });
    }

    return await next();
});
