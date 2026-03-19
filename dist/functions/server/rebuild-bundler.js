import allPagesBundler from "../bundler/all-pages-bundler";
import serverPostBuildFn from "./server-post-build-fn";
import { log } from "../../utils/log";
export default async function rebuildBundler() {
    try {
        global.ROUTER.reload();
        await global.BUNDLER_CTX?.dispose();
        global.BUNDLER_CTX = undefined;
        await allPagesBundler({
            watch: true,
            post_build_fn: serverPostBuildFn,
        });
    }
    catch (error) {
        log.error(error);
    }
}
