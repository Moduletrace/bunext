import type { ServeOptions } from "bun";
import grabAppPort from "../../utils/grab-app-port";
import isDevelopment from "../../utils/is-development";
import bunextRequestHandler from "./bunext-req-handler";

type Params = {
    dev?: boolean;
};

export default async function (params?: Params): Promise<ServeOptions> {
    const port = grabAppPort();

    const is_dev = isDevelopment();

    return {
        async fetch(req, server) {
            return await bunextRequestHandler({ req });
        },
        port,
        // idleTimeout: 0,
        development: {
            hmr: true,
        },
    } as ServeOptions;
}
