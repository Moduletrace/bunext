import allPagesBundler from "../bundler/all-pages-bundler";
import serverPostBuildFn from "./server-post-build-fn";
import { log } from "../../utils/log";

type Params = {
    target_file_paths?: string[];
};

export default async function rebuildBundler(params?: Params) {
    try {
        global.ROUTER.reload();

        // await global.BUNDLER_CTX?.dispose();
        // global.BUNDLER_CTX = undefined;

        await allPagesBundler({
            page_file_paths: params?.target_file_paths,
        });

        await serverPostBuildFn();
    } catch (error: any) {
        log.error(error);
    }
}
