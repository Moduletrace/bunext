import type { WebSocketHandler } from "bun";

export const BunextWebsocket: WebSocketHandler<any> = {
    message(ws, message) {
        console.log(`WS Message => ${message}`);
    },
};
