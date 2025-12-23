import pg from "pg";

const { Client } = pg;

interface RealtimePayload {
    table: string;
    action: "INSERT" | "UPDATE" | "DELETE";
    data: any;
    old_data?: any;
}

const wsClients = new Map<
    any,
    {
        tables?: string[];
        userId?: string;
        filters?: Record<string, any>;
    }
>();

export function registerClient(
    ws: any,
    options?: {
        tables?: string[];
        userId?: string;
        filters?: Record<string, any>;
    }
) {
    wsClients.set(ws, options || {});
    console.log(`📡 Client registered. Total clients: ${wsClients.size}`);
}

export function unregisterClient(ws: any) {
    wsClients.delete(ws);
    console.log(`📡 Client unregistered. Total clients: ${wsClients.size}`);
}

function broadcast(payload: RealtimePayload) {
    let sentCount = 0;

    for (const [ws, options] of wsClients.entries()) {
        if (options.tables && !options.tables.includes(payload.table)) {
            continue;
        }

        // Apply custom filters (e.g., user_id match)
        if (options.filters) {
            const matchesFilter = Object.entries(options.filters).every(([key, value]) => {
                return payload.data?.[key] === value;
            });
            if (!matchesFilter) continue;
        }

        try {
            if (ws.readyState === 1) {
                ws.send(JSON.stringify({ ...payload, type: "events" }));
                sentCount++;
            }
        } catch (error) {
            console.error("Error sending to client:", error);
            wsClients.delete(ws);
        }
    }

    if (sentCount > 0) {
        console.log(`📤 Broadcast ${payload.action} on ${payload.table} to ${sentCount} clients`);
    }
}

export async function createRealtimeListener() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("✅ Connected to Postgres for real-time listening");
        await client.query("LISTEN table_changes");

        client.on("notification", (msg) => {
            if (msg.channel === "table_changes") {
                try {
                    const payload: RealtimePayload = JSON.parse(msg.payload || "{}");
                    broadcast(payload);
                } catch (error) {
                    console.error("Error parsing notification:", error);
                }
            }
        });

        client.on("error", (err) => {
            console.error("Postgres listener error:", err);
        });

        client.on("end", () => {
            console.log("Postgres listener connection ended");
            setTimeout(() => {
                console.log("Attempting to reconnect...");
                createRealtimeListener();
            }, 5000);
        });

        return client;
    } catch (error) {
        console.error("Failed to connect to Postgres:", error);
        throw error;
    }
}

export function getListenerStatus() {
    return {
        connectedClients: wsClients.size,
        isActive: wsClients.size > 0,
    };
}
