import { log } from "../../utils/log";

type Params = {};

export default async function buildOnstartErrorHandler(params?: Params) {
    // const error_msg = `Build Failed. Please check all your components and imports.`;
    // log.error(error_msg);

    global.BUNDLER_CTX_DISPOSED = true;

    global.RECOMPILING = false;
    global.IS_SERVER_COMPONENT = false;

    await Promise.all([
        global.SSR_BUNDLER_CTX?.dispose(),
        global.BUNDLER_CTX?.dispose(),
    ]);

    global.SSR_BUNDLER_CTX = undefined;
    global.BUNDLER_CTX = undefined;
}
