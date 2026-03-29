import grabAppPort from "../../utils/grab-app-port";
import isDevelopment from "../../utils/is-development";
import bunextRequestHandler from "./bunext-req-handler";
import grabConfig from "../grab-config";
import _ from "lodash";

export default async function (): Promise<Bun.Serve.Options<any>> {
    const port = grabAppPort();

    const development = isDevelopment();
    const config = await grabConfig();

    return {
        async fetch(req, server) {
            return await bunextRequestHandler({ req, server });
        },
        port,
        idleTimeout: development ? 0 : undefined,
        development,
        websocket: config?.websocket,
        ..._.omit(config?.serverOptions || {}, ["fetch"]),
    } as Bun.Serve.Options<any>;
}
