import { type Plugin } from "esbuild";
import type { PageFiles } from "../../../types";
import { log } from "../../../utils/log";
import grabArtifactsFromBundledResults from "../grab-artifacts-from-bundled-result";
import pagesSSRContextBundler from "../pages-ssr-context-bundler";

let buildStart = 0;
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
                buildStart = performance.now();

                if (build_starts == MAX_BUILD_STARTS) {
                    const error_msg = `Build Failed. Please check all your components and imports.`;
                    log.error(error_msg);

                    global.BUNDLER_CTX_DISPOSED = true;

                    global.RECOMPILING = false;
                    global.IS_SERVER_COMPONENT = false;

                    await global.SSR_BUNDLER_CTX?.dispose();
                    global.SSR_BUNDLER_CTX = undefined;

                    await global.BUNDLER_CTX?.dispose();
                    global.BUNDLER_CTX = undefined;
                }
            });

            build.onEnd((result) => {
                if (result.errors.length > 0) {
                    // for (const error of result.errors) {
                    //     const loc = error.location;
                    //     const location = loc
                    //         ? ` ${loc.file}:${loc.line}:${loc.column}`
                    //         : "";
                    //     log.error(`[Build]${location} ${error.text}`);
                    // }
                    return;
                }

                // if (result.errors.length) {
                //     console.error(
                //         esbuild.formatMessagesSync(result.errors, {
                //             kind: "error",
                //         }),
                //     );
                // }

                // if (result.warnings.length) {
                //     console.warn(
                //         esbuild.formatMessagesSync(result.warnings, {
                //             kind: "warning",
                //         }),
                //     );
                // }

                const artifacts = grabArtifactsFromBundledResults({
                    result,
                    entryToPage,
                });

                // console.log("artifacts", artifacts);

                if (artifacts?.[0] && artifacts.length > 0) {
                    for (let i = 0; i < artifacts.length; i++) {
                        const artifact = artifacts[i];
                        if (artifact?.local_path && global.BUNDLER_CTX_MAP) {
                            global.BUNDLER_CTX_MAP[artifact.local_path] =
                                artifact;
                        }
                    }

                    post_build_fn?.({ artifacts });
                }

                const elapsed = (performance.now() - buildStart).toFixed(0);
                log.success(`[Built] in ${elapsed}ms`);

                global.RECOMPILING = false;
                global.IS_SERVER_COMPONENT = false;

                build_starts = 0;

                if (global.SSR_BUNDLER_CTX) {
                    global.SSR_BUNDLER_CTX.rebuild();
                } else {
                    pagesSSRContextBundler();
                }
            });
        },
    };

    return artifactTracker;
}
