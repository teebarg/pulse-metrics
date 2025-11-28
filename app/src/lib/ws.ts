import { WSClient } from "pulsews";

let wsInstance: WSClient | null = null;

export function getWSClient() {
    if (!wsInstance) {
        wsInstance = new WSClient({
            url: "ws://localhost:7063/ws",
            heartbeatInterval: 30000,
        });
        wsInstance.connect();
    }
    return wsInstance;
}
