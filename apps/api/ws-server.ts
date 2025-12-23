import { WebSocketServer, WebSocket } from "ws";
import { parse } from "url";

interface Client {
    ws: WebSocket;
    userId?: string;
    subscriptions: Set<string>; // e.g., ["user:123", "org:456"]
}

class RealtimeWebSocketServer {
    private wss: WebSocketServer;
    private clients: Map<WebSocket, Client> = new Map();

    constructor(server: any) {
        this.wss = new WebSocketServer({ noServer: true });

        // Handle upgrade
        server.on("upgrade", (request: any, socket: any, head: any) => {
            const { pathname } = parse(request.url);

            if (pathname === "/ws") {
                this.wss.handleUpgrade(request, socket, head, (ws) => {
                    this.wss.emit("connection", ws, request);
                });
            } else {
                socket.destroy();
            }
        });

        this.wss.on("connection", this.handleConnection.bind(this));
    }

    private handleConnection(ws: WebSocket) {
        const client: Client = {
            ws,
            subscriptions: new Set(),
        };

        this.clients.set(ws, client);
        console.log("🔌 Client connected. Total clients:", this.clients.size);

        this.sendToClient(ws, {
            type: "connected",
            message: "Connected to realtime server",
        });

        ws.on("message", (data) => this.handleMessage(ws, data));
        ws.on("close", () => this.handleDisconnect(ws));
        ws.on("error", (error) => {
            console.error("WebSocket error:", error);
            this.handleDisconnect(ws);
        });
    }

    private handleMessage(ws: WebSocket, data: any) {
        try {
            const message = JSON.parse(data.toString());
            const client = this.clients.get(ws);

            if (!client) return;

            switch (message.type) {
                case "subscribe":
                    // Subscribe to specific channels
                    // e.g., { type: "subscribe", channels: ["user:123", "org:456"] }
                    if (Array.isArray(message.channels)) {
                        message.channels.forEach((channel: string) => {
                            client.subscriptions.add(channel);
                        });
                        console.log(`Client subscribed to:`, Array.from(client.subscriptions));
                        this.sendToClient(ws, {
                            type: "subscribed",
                            channels: Array.from(client.subscriptions),
                        });
                    }
                    break;

                case "unsubscribe":
                    if (Array.isArray(message.channels)) {
                        message.channels.forEach((channel: string) => {
                            client.subscriptions.delete(channel);
                        });
                        this.sendToClient(ws, {
                            type: "unsubscribed",
                            channels: message.channels,
                        });
                    }
                    break;

                case "auth":
                    // Authenticate user
                    client.userId = message.userId;
                    console.log(`Client authenticated as user: ${message.userId}`);
                    this.sendToClient(ws, {
                        type: "authenticated",
                        userId: message.userId,
                    });
                    break;

                case "ping":
                    this.sendToClient(ws, { type: "pong" });
                    break;
            }
        } catch (error) {
            console.error("Error handling message:", error);
        }
    }

    private handleDisconnect(ws: WebSocket) {
        this.clients.delete(ws);
        console.log("🔌 Client disconnected. Total clients:", this.clients.size);
    }

    private sendToClient(ws: WebSocket, data: any) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    public broadcast(data: any, channels?: string[]) {
        const payload = JSON.stringify(data);

        for (const [ws, client] of this.clients.entries()) {
            if (ws.readyState === WebSocket.OPEN) {
                // If channels specified, only send to subscribed clients
                if (channels && channels.length > 0) {
                    const hasSubscription = channels.some((channel) => client.subscriptions.has(channel));
                    if (hasSubscription) {
                        ws.send(payload);
                    }
                } else {
                    ws.send(payload);
                }
            }
        }
    }

    public broadcastToUser(userId: string, data: any) {
        const payload = JSON.stringify(data);

        for (const [ws, client] of this.clients.entries()) {
            if (client.userId === userId && ws.readyState === WebSocket.OPEN) {
                ws.send(payload);
            }
        }
    }

    public getStats() {
        return {
            totalClients: this.clients.size,
            clients: Array.from(this.clients.values()).map((client) => ({
                userId: client.userId,
                subscriptions: Array.from(client.subscriptions),
            })),
        };
    }
}

export default RealtimeWebSocketServer;
