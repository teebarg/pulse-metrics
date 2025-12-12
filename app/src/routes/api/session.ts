import { createFileRoute } from "@tanstack/react-router";
import { auth } from "~/lib/auth";

export const Route = createFileRoute("/api/session")({
    server: {
        handlers: {
            GET: async ({ request }: { request: Request }) => {
                const session = await auth.api.getSession({
                    headers: request.headers,
                });
                return new Response(JSON.stringify(session), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            },
        },
    },
});
