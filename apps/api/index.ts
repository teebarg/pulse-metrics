import "dotenv/config";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

import { authMiddleware } from "~/middleware/auth.js";
import { errorHandler } from "~/middleware/error-handler.js";
import { profileRoutes } from "~/routes/profile.routes";
import { healthRoute } from "~/routes/health.routes";
import { analyticsRoutes } from "~/routes/analytics.routes";
import { onBoardingRoutes } from "~/routes/onboarding.routes";
import { createNodeWebSocket } from "@hono/node-ws";
import { createRealtimeListener, registerClient, unregisterClient } from "./realtime-listener";
import { organizationRoutes } from "~/routes/organization.routes";
import { eventsRoute } from "~/routes/events.routes";
import { settingsRoutes } from "~/routes/settings.routes";

const port = Number(process.env.API_PORT || 8787);

const app = new OpenAPIHono();

app.use("*", cors());
app.use("*", prettyJSON());
app.onError(errorHandler);

app.use("/v1/profile/*", authMiddleware);
app.use("/v1/onboarding/*", authMiddleware);
app.use("/v1/organization/*", authMiddleware);

app.route("/", healthRoute);
app.route("/v1/profile", profileRoutes);
app.route("/v1/analytics", analyticsRoutes);
app.route("/v1/events", eventsRoute);
app.route("/v1/onboarding", onBoardingRoutes);
app.route("/v1/organization", organizationRoutes);
app.route("/v1/settings", settingsRoutes);

app.doc("/doc", {
    openapi: "3.0.0",
    info: {
        title: "Pulse Metrics API",
        version: "1.0.0",
    },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

app.get("/", (c) => {
    return c.json({
        message: "Hello from Hono API!",
        docs: "/ui",
        openapi: "/doc",
    });
});

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });
app.get(
    "/ws",
    upgradeWebSocket((c) => {
        return {
            onOpen(event, ws) {
                console.log("🚀 ~ file: index.ts:58 ~ event:", event);
                console.log("Connection opened");
                // Register client with optional filters
                // You can extract these from query params or auth
                registerClient(ws, {
                    tables: ["events", "profile"], // Subscribe to specific tables
                    // userId: c.get("userId"), // Filter by user if authenticated
                    // filters: { user_id: "123" }, // Custom filters
                });
            },
            onMessage(event, ws) {
                // console.log(`Message from client: ${event.data}`);
                // ws.send(JSON.stringify({ type: "debug", message: "Hello from server!" }));
                try {
                    const message = JSON.parse(event.data.toString());
                    console.log(`📨 Message from client:`, message);

                    // Handle client messages (e.g., subscribe/unsubscribe)
                    if (message.type === "subscribe") {
                        registerClient(ws, {
                            tables: message.tables || [],
                            filters: message.filters || {},
                        });
                        ws.send(
                            JSON.stringify({
                                type: "subscribed",
                                tables: message.tables,
                            })
                        );
                    }
                } catch (error) {
                    console.error("Error handling message:", error);
                }
            },
            onClose(event, ws) {
                console.log("Connection closed");
                unregisterClient(ws);
            },
            onError(evt: any, ws) {
                console.error("WebSocket error observed:", evt?.message);
                unregisterClient(ws);
            },
        };
    })
);

const startServer = async () => {
    const { serve } = await import("@hono/node-server");
    const server = serve(
        {
            fetch: app.fetch,
            port,
        },
        (info) => {
            console.log(`Server is running on http://localhost:${info.port}`);
        }
    );

    injectWebSocket(server);
    try {
        await createRealtimeListener();
        console.log("🎧 Real-time listener started");
    } catch (error) {
        console.error("Failed to start real-time listener:", error);
    }
};

startServer().catch(console.error);

export default app;
