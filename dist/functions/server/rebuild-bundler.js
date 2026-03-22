import allPagesBundler from "../bundler/all-pages-bundler";
import serverPostBuildFn from "./server-post-build-fn";
import { log } from "../../utils/log";
export default async function rebuildBundler(params) {
    try {
        global.ROUTER.reload();
        // await global.BUNDLER_CTX?.dispose();
        // global.BUNDLER_CTX = undefined;
        await allPagesBundler({
            page_file_paths: params?.target_file_paths,
        });
        await serverPostBuildFn();
    }
    catch (error) {
        log.error(error);
    }
}
