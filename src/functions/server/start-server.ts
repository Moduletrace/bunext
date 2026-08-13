import _ from "lodash";
import { log } from "../../utils/log";
import serverParamsGen from "./server-params-gen";
import isDevelopment from "../../utils/is-development";
import watcherEsbuildCTX from "./watcher-esbuild-ctx";

export default async function startServer() {
    const serverParams = await serverParamsGen();

    const server = Bun.serve(serverParams);
    const is_dev = isDevelopment();

    global.BUNEXT_SERVER = server;

    log.server(`http://${server.hostname}:${server.port}`);

    if (is_dev) {
        setInterval(() => {
            if (global.BUNEXT_PAGES_SRC_WATCHER) {
                global.BUNEXT_PAGES_SRC_WATCHER.close();
                watcherEsbuildCTX();
            }
        }, 5000);
    }

    return server;
}
