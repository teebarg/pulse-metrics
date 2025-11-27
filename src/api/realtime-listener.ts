import { Pool } from "pg";

// export function createRealtimeListener(broadcast: (data: any) => void) {
//     const pool = new Pool({
//         connectionString: process.env.DATABASE_URL,
//     });

//     (async () => {
//         const client = await pool.connect();
//         await client.query("LISTEN events_channel");

//         console.log("👂 Listening for Postgres events...");

//         client.on("notification", (msg) => {
//             try {
//                 const payload = JSON.parse(msg.payload!);
//                 console.log("🚀 New Event:", payload);
//                 broadcast(payload); // Send to all subscribed websocket clients
//             } catch (err) {
//                 console.error("Invalid payload:", err);
//             }
//         });
//     })();
// }

import pg from "pg";

const { Client } = pg;

interface RealtimePayload {
    table: string;
    action: "INSERT" | "UPDATE" | "DELETE";
    data: any;
    old_data?: any;
}

// Store WebSocket clients with their subscriptions
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

// Broadcast to specific clients based on filters
function broadcast(payload: RealtimePayload) {
    console.log("🚀 ~ file: realtime-listener.ts:66 ~ payload:", payload)
    let sentCount = 0;

    for (const [ws, options] of wsClients.entries()) {
        console.log("🚀 ~ file: realtime-listener.ts:70 ~ options:", options)
        // Check if client is interested in this table
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
                ws.send(JSON.stringify(payload));
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

// Create and start the Postgres listener
export async function createRealtimeListener() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("✅ Connected to Postgres for real-time listening");

        // Listen to the notification channel
        await client.query("LISTEN table_changes");

        // Handle notifications
        client.on("notification", (msg) => {
            console.log("🚀 ~ file: realtime-listener.ts:114 ~ msg:", msg)
            console.log(msg.channel)
            console.log(msg.payload)
            console.log("yooooo.........")
            if (msg.channel === "table_changes") {
                console.log("Broadcasting......")
                try {
                    const payload: RealtimePayload = JSON.parse(msg.payload || "{}");
                    broadcast(payload);
                } catch (error) {
                    console.error("Error parsing notification:", error);
                }
            }
        });

        // Handle connection errors
        client.on("error", (err) => {
            console.error("Postgres listener error:", err);
        });

        client.on("end", () => {
            console.log("Postgres listener connection ended");
            // Attempt to reconnect after 5 seconds
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
