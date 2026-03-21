import type { BunextConfig } from "../../dist/types";
import { BunextWebsocket } from "./websocket";

const config: BunextConfig = {
    websocket: BunextWebsocket,
};

export default config;
