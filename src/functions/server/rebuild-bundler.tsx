import serverPostBuildFn from "./server-post-build-fn";
import { log } from "../../utils/log";
import allPagesBunBundler from "../bundler/all-pages-bun-bundler";
import cleanupArtifacts from "./cleanup-artifacts";

type Params = {
    target_file_paths?: string[];
};

export default async function rebuildBundler(params?: Params) {
    try {
        global.ROUTER.reload();

        const new_artifacts = await allPagesBunBundler({
            page_file_paths: params?.target_file_paths,
        });

        await serverPostBuildFn();

        if (new_artifacts?.[0]) {
            cleanupArtifacts({ new_artifacts });
        }
    } catch (error: any) {
        log.error(error);
    }
}
