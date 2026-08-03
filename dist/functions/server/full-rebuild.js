import { log } from "../../utils/log";
import allPagesESBuildContextBundler from "../bundler/all-pages-esbuild-context-bundler";
import serverPostBuildFn from "./server-post-build-fn";
import watcherEsbuildCTX from "./watcher-esbuild-ctx";
export default async function fullRebuild(params) {
    try {
        const { msg } = params || {};
        global.BUNEXT_RECOMPILING = true;
        if (msg) {
            log.watch(msg);
        }
        global.BUNEXT_ROUTER.reload();
        try {
            await global.BUNEXT_BUNDLER_CTX?.dispose();
            global.BUNEXT_BUNDLER_CTX = undefined;
            await global.BUNEXT_SSR_BUNDLER_CTX?.dispose();
            global.BUNEXT_SSR_BUNDLER_CTX = undefined;
        }
        catch (error) { }
        await allPagesESBuildContextBundler({
            post_build_fn: async () => {
                await serverPostBuildFn();
            },
        });
    }
    catch (error) {
        log.error(error);
    }
    finally {
        global.BUNEXT_RECOMPILING = false;
        global.BUNEXT_IS_SERVER_COMPONENT = false;
    }
    if (global.BUNEXT_PAGES_SRC_WATCHER) {
        global.BUNEXT_PAGES_SRC_WATCHER.close();
        watcherEsbuildCTX();
    }
}
