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
const MAX_BUILD_STARTS = 2;

type Params = {
    entryToPage: Map<
        string,
        PageFiles & {
            tsx: string;
        }
    >;
    post_build_fn?: (params: { artifacts: any[] }) => Promise<void> | void;
    build_only?: boolean;
};

export default function esbuildCTXArtifactTracker({
    entryToPage,
    post_build_fn,
    build_only,
}: Params) {
    const artifactTracker: Plugin = {
        name: "artifact-tracker",
        setup(build) {
            build.onStart(async () => {
                global.BUNEXT_MAIN_CTX_BUILD_STARTS++;
                build_start = performance.now();

                const does_error_file_exist = existsSync(
                    BUNX_BUNDLER_ERROR_EXIT_FILE,
                );

                if (
                    global.BUNEXT_MAIN_CTX_BUILD_STARTS >= MAX_BUILD_STARTS &&
                    !does_error_file_exist
                ) {
                    await buildOnstartErrorHandler();
                }
            });

            build.onEnd(async (result) => {
                if (result.errors.length > 0) {
                    global.BUNEXT_RECOMPILING = false;
                    global.BUNEXT_IS_SERVER_COMPONENT = false;

                    log.error(`Build errors:`);
                    for (const err of result.errors) {
                        log.error(
                            `  ${err.text}${err.location ? ` (${err.location.file}:${err.location.line}:${err.location.column})` : ""}`,
                        );
                    }

                    for (
                        let i = global.BUNEXT_HMR_CONTROLLERS.length - 1;
                        i >= 0;
                        i--
                    ) {
                        const controller = global.BUNEXT_HMR_CONTROLLERS[i];
                        try {
                            controller?.controller?.enqueue(
                                `event: update\ndata: ${JSON.stringify({ reload: true })}\n\n`,
                            );
                        } catch {
                            global.BUNEXT_HMR_CONTROLLERS.splice(i, 1);
                        }
                    }

                    return;
                }

                const artifacts = grabArtifactsFromBundledResults({
                    result,
                    entryToPage,
                });

                if (artifacts?.[0] && artifacts.length > 0) {
                    for (let i = 0; i < artifacts.length; i++) {
                        const artifact = artifacts[i];
                        if (
                            artifact?.local_path &&
                            global.BUNEXT_BUNDLER_CTX_MAP
                        ) {
                            global.BUNEXT_BUNDLER_CTX_MAP[artifact.local_path] =
                                _.merge(
                                    global.BUNEXT_BUNDLER_CTX_MAP[
                                        artifact.local_path
                                    ],
                                    artifact,
                                );
                        }
                    }
                }

                const elapsed = (performance.now() - build_start).toFixed(0);
                log.success(`[Built] in ${elapsed}ms`);

                global.BUNEXT_MAIN_CTX_BUILD_STARTS = 0;
                global.BUNEXT_BUNDLER_CTX_DISPOSED = false;

                const does_error_file_exist = existsSync(
                    BUNX_BUNDLER_ERROR_EXIT_FILE,
                );

                // SSR must finish before HMR so server props are fresh
                if (build_only) {
                    try {
                        await pagesSSRBundler();
                    } catch (error) {
                        log.error(`SSR Bundler Error: ${error}`);
                    }
                } else if (does_error_file_exist) {
                    mkdirSync(BUNX_ERROR_LOGS_DIR, { recursive: true });
                    cpSync(
                        BUNX_BUNDLER_ERROR_EXIT_FILE,
                        path.join(BUNX_ERROR_LOGS_DIR, `${Date.now()}.log`),
                    );
                    rmSync(BUNX_BUNDLER_ERROR_EXIT_FILE, { force: true });
                    cleanupLogsDirs();
                    await fullRebuild();
                } else {
                    try {
                        await pagesSSRBundler();
                    } catch (error) {
                        log.error(`SSR Bundler Error: ${error}`);
                    }

                    if (artifacts?.[0] && artifacts.length > 0) {
                        try {
                            await post_build_fn?.({ artifacts });
                        } catch (error) {
                            log.error(`Post-build Error: ${error}`);
                        }
                    }
                }

                global.BUNEXT_RECOMPILING = false;
                global.BUNEXT_IS_SERVER_COMPONENT = false;
            });
        },
    };

    return artifactTracker;
}
