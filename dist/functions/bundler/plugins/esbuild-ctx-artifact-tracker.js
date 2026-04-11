import {} from "esbuild";
import { log } from "../../../utils/log";
import grabArtifactsFromBundledResults from "../grab-artifacts-from-bundled-result";
import pagesSSRContextBundler from "../pages-ssr-context-bundler";
import buildOnstartErrorHandler from "../build-on-start-error-handler";
import apiRoutesContextBundler from "../api-routes-context-bundler";
import _ from "lodash";
let build_start = 0;
let build_starts = 0;
const MAX_BUILD_STARTS = 2;
export default function esbuildCTXArtifactTracker({ entryToPage, post_build_fn, }) {
    const artifactTracker = {
        name: "artifact-tracker",
        setup(build) {
            build.onStart(async () => {
                build_starts++;
                build_start = performance.now();
                if (build_starts == MAX_BUILD_STARTS) {
                    await buildOnstartErrorHandler();
                }
            });
            build.onEnd((result) => {
                if (result.errors.length > 0) {
                    return;
                }
                const artifacts = grabArtifactsFromBundledResults({
                    result,
                    entryToPage,
                });
                if (artifacts?.[0] && artifacts.length > 0) {
                    for (let i = 0; i < artifacts.length; i++) {
                        const artifact = artifacts[i];
                        if (artifact?.local_path && global.BUNDLER_CTX_MAP) {
                            global.BUNDLER_CTX_MAP[artifact.local_path] =
                                _.merge(global.BUNDLER_CTX_MAP[artifact.local_path], artifact);
                        }
                    }
                    post_build_fn?.({ artifacts });
                }
                const elapsed = (performance.now() - build_start).toFixed(0);
                log.success(`[Built] in ${elapsed}ms`);
                global.RECOMPILING = false;
                global.IS_SERVER_COMPONENT = false;
                build_starts = 0;
                if (global.SSR_BUNDLER_CTX) {
                    global.SSR_BUNDLER_CTX.rebuild();
                }
                else {
                    pagesSSRContextBundler();
                }
                if (global.API_ROUTES_BUNDLER_CTX) {
                    global.API_ROUTES_BUNDLER_CTX.rebuild();
                }
                else {
                    apiRoutesContextBundler();
                }
            });
        },
    };
    return artifactTracker;
}
