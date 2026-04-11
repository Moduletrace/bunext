import { log } from "../../utils/log";
import allPagesESBuildContextBundler from "../bundler/all-pages-esbuild-context-bundler";
import serverPostBuildFn from "./server-post-build-fn";
import watcherEsbuildCTX from "./watcher-esbuild-ctx";

export default async function fullRebuild(params?: { msg?: string }) {
    try {
        const { msg } = params || {};

        global.RECOMPILING = true;

        if (msg) {
            log.watch(msg);
        }

        global.ROUTER.reload();

        await global.BUNDLER_CTX?.dispose();
        global.BUNDLER_CTX = undefined;
        global.BUNDLER_CTX_MAP = {};

        await global.SSR_BUNDLER_CTX?.dispose();
        global.SSR_BUNDLER_CTX = undefined;
        global.SSR_BUNDLER_CTX_MAP = {};

        allPagesESBuildContextBundler({
            post_build_fn: serverPostBuildFn,
        });
    } catch (error: any) {
        log.error(error);
    }

    if (global.PAGES_SRC_WATCHER) {
        global.PAGES_SRC_WATCHER.close();
        watcherEsbuildCTX();
    }
}
