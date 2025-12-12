import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { auth } from "~/lib/auth";

export const unAuthMiddleware = createMiddleware().server(
    async ({ next, request }) => {
        const session = await auth.api.getSession({ headers: request.headers })

        if (session) {
            throw redirect({ to: "/account" })
        }

        return await next()
    }
);
