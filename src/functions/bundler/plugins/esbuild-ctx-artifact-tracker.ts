import { type Plugin } from "esbuild";
import type { PageFiles } from "../../../types";
import { log } from "../../../utils/log";
import grabArtifactsFromBundledResults from "../grab-artifacts-from-bundled-result";
import buildOnstartErrorHandler from "../build-on-start-error-handler";
import _ from "lodash";
import pagesSSRBundler from "../pages-ssr-bundler";

let build_start = 0;
let build_starts = 0;
const MAX_BUILD_STARTS = 2;

type Params = {
    entryToPage: Map<
        string,
        PageFiles & {
            tsx: string;
        }
    >;
    post_build_fn?: (params: { artifacts: any[] }) => Promise<void> | void;
};

export default function esbuildCTXArtifactTracker({
    entryToPage,
    post_build_fn,
}: Params) {
    const artifactTracker: Plugin = {
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
                                _.merge(
                                    global.BUNDLER_CTX_MAP[artifact.local_path],
                                    artifact,
                                );
                        }
                    }

                    post_build_fn?.({ artifacts });
                }

                const elapsed = (performance.now() - build_start).toFixed(0);
                log.success(`[Built] in ${elapsed}ms`);

                global.RECOMPILING = false;
                global.IS_SERVER_COMPONENT = false;

                build_starts = 0;

                pagesSSRBundler();

                // if (global.SSR_BUNDLER_CTX) {
                //     global.SSR_BUNDLER_CTX.rebuild();
                // } else {
                //     pagesSSRContextBundler();
                // }
            });
        },
    };

    return artifactTracker;
}
