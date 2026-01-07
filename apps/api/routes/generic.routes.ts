import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { SuccessSchema } from "../schemas/common.schemas.ts";
import { getListenerStatus } from "../realtime-listener.ts";
import { z } from "zod";
import { sendMagicLink } from "../services/generic.service.tsx";

export const genericRoute = new OpenAPIHono();

genericRoute.openapi(
    createRoute({
        method: "get",
        path: "/health",
        tags: ["system"],
        description: "Health check endpoint",
        responses: {
            200: {
                content: { "application/json": { schema: SuccessSchema } },
                description: "Success",
            },
        },
    }),
    (c) => c.json({ message: "Server is running", ok: true })
);

genericRoute.get("/", (c) =>
    c.json({
        message: "Hello from Hono API!",
        docs: "/ui",
        openapi: "/doc",
    })
);

genericRoute.openapi(
    createRoute({
        method: "get",
        path: "/realtime/status",
        tags: ["system"],
        description: "Get realtime listener status",
        responses: {
            200: {
                content: { "application/json": { schema: z.object({ connectedClients: z.number(), isActive: z.boolean() }) } },
                description: "Success",
            },
        },
    }),
    async (c) => {
        const status = await getListenerStatus();
        return c.json(status);
    }
);

genericRoute.openapi(
    createRoute({
        method: "post",
        path: "/magic-link",
        tags: ["system"],
        description: "Send magic link to email",
        request: {
            body: {
                content: { "application/json": { schema: z.object({ magicLink: z.string(), email: z.string() }) } },
            },
        },
        responses: {
            200: {
                content: { "application/json": { schema: z.object({ message: z.string() }) } },
                description: "Success",
            },
        },
    }),
    async (c) => {
        const data = c.req.valid("json");
        await sendMagicLink(data.magicLink, data.email);
        return c.json({ message: "Magic link sent successfully" });
    }
);
