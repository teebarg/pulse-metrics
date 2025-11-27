import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { SuccessSchema } from "@/api/schemas/common.schemas.js";
import { getListenerStatus } from "../realtime-listener";
import { z } from "zod";

export const healthRoute = new OpenAPIHono();

healthRoute.openapi(
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

healthRoute.get("/", (c) =>
    c.json({
        message: "Hello from Hono API!",
        docs: "/ui",
        openapi: "/doc",
    })
);

healthRoute.openapi(
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
