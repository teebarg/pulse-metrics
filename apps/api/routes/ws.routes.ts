import { Hono } from "hono";
import { upgradeWebSocket } from "hono/ws";

export const wsRoute = new Hono();

wsRoute.get(
    "/",
    upgradeWebSocket((c) => {
        return {
            onOpen(_, ws) {
                console.log("WS connected");
                ws.send("Welcome to Pulse Metrics WebSocket!");
            },

            onMessage(_, ws, message) {
                console.log("Message from client:", message);
                ws.send(`Received: ${message}`);
            },

            onClose() {
                console.log("WS closed");
            },
        };
    })
);
