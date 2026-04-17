import { type Plugin } from "esbuild";
import type { PageFiles } from "../../../types";
import { log } from "../../../utils/log";
import grabArtifactsFromBundledResults from "../grab-artifacts-from-bundled-result";
import buildOnstartErrorHandler from "../build-on-start-error-handler";
import _ from "lodash";
import pagesSSRBundler from "../pages-ssr-bundler";
import grabDirNames from "../../../utils/grab-dir-names";
import { cpSync, existsSync, mkdirSync, rmSync } from "fs";
import fullRebuild from "../../server/full-rebuild";
import path from "path";
import cleanupLogsDirs from "../../cleanup-logs-dir";

const { BUNX_BUNDLER_ERROR_EXIT_FILE, BUNX_ERROR_LOGS_DIR } = grabDirNames();

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

                const does_error_file_exist = existsSync(
                    BUNX_BUNDLER_ERROR_EXIT_FILE,
                );

                if (
                    build_starts == MAX_BUILD_STARTS &&
                    !does_error_file_exist
                ) {
                    await buildOnstartErrorHandler();
                    process.exit(1);
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

                const does_error_file_exist = existsSync(
                    BUNX_BUNDLER_ERROR_EXIT_FILE,
                );

                if (does_error_file_exist) {
                    mkdirSync(BUNX_ERROR_LOGS_DIR, { recursive: true });
                    cpSync(
                        BUNX_BUNDLER_ERROR_EXIT_FILE,
                        path.join(BUNX_ERROR_LOGS_DIR, `${Date.now()}.log`),
                    );
                    rmSync(BUNX_BUNDLER_ERROR_EXIT_FILE, { force: true });
                    cleanupLogsDirs();
                    fullRebuild();
                } else {
                    pagesSSRBundler();
                }

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
