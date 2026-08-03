import { watch, existsSync, statSync, glob } from "fs";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import fullRebuild from "./full-rebuild";
import { AppData } from "../../data/app-data";
import checkExcludedPatterns from "../../utils/check-excluded-patterns";
import pagesSSRBundler from "../bundler/pages-ssr-bundler";
import { log } from "../../utils/log";

const { ROOT_DIR, BUNX_BUNDLER_ERROR_EXIT_FILE } = grabDirNames();

export default async function watcherEsbuildCTX() {
    const pages_src_watcher = watch(
        ROOT_DIR,
        {
            recursive: true,
            persistent: true,
        },
        async (event, filename) => {
            let owns_recompile = false;

            try {
                if (!filename) return;
                const full_file_path = path.join(ROOT_DIR, filename);

                if (global.BUNEXT_CONFIG.exclude_watch_patterns) {
                    for (
                        let i = 0;
                        i < global.BUNEXT_CONFIG.exclude_watch_patterns.length;
                        i++
                    ) {
                        const watch_pattern =
                            global.BUNEXT_CONFIG.exclude_watch_patterns[i];

                        if (watch_pattern instanceof RegExp) {
                            const is_path_excluded =
                                watch_pattern.test(filename);
                            if (is_path_excluded) {
                                return;
                            }
                        } else {
                            const excluded_path = path.resolve(
                                ROOT_DIR,
                                watch_pattern,
                            );

                            if (excluded_path == full_file_path) {
                                return;
                            }
                        }
                    }
                }

                if (existsSync(BUNX_BUNDLER_ERROR_EXIT_FILE)) {
                    await fullRebuild();
                    return;
                }

                if (filename.match(/^\.\w+/)) {
                    return;
                }

                if (global.BUNEXT_BUNDLER_CTX_DISPOSED) {
                    await fullRebuild({ msg: `Restarting Bundler ...` });
                    return;
                }

                if (global.BUNEXT_SSR_BUNDLER_CTX_DISPOSED) {
                    await pagesSSRBundler().catch((error) => {
                        log.error(`SSR Bundler Error: ${error}`);
                    });
                }

                if (filename.endsWith(AppData["BunextTmpFileExt"])) {
                    return;
                }

                const does_file_exist = existsSync(full_file_path);
                const file_stat = does_file_exist
                    ? statSync(full_file_path)
                    : undefined;

                if (full_file_path.match(/\/styles$/)) {
                    owns_recompile = true;
                    global.BUNEXT_RECOMPILING = true;
                    await Bun.sleep(1000);
                    await fullRebuild({
                        msg: `Detected new \`styles\` directory. Rebuilding ...`,
                    });
                    return;
                }

                const excluded_match =
                    /node_modules\/|^public\/|^\.bunext\/|^\.git\/|^\.?dist\/|bun\.lockb$/;

                if (filename.match(excluded_match)) return;

                if (filename.match(/bunext.config\.ts/)) {
                    await fullRebuild({
                        msg: `bunext.config.ts file changed. Rebuilding server ...`,
                    });
                    return;
                }

                const target_files_match = /\.(tsx?|jsx?|css)$/;

                if (event !== "rename") {
                    if (filename.match(target_files_match)) {
                        if (global.BUNEXT_RECOMPILING) return;
                        owns_recompile = true;
                        global.BUNEXT_RECOMPILING = true;

                        if (filename.match(/.*\.server\.tsx?/)) {
                            global.BUNEXT_IS_SERVER_COMPONENT = true;
                        }

                        if (global.BUNEXT_BUNDLER_CTX) {
                            await global.BUNEXT_BUNDLER_CTX.rebuild();
                        }

                        if (filename.match(/(404|500)\.tsx?/)) {
                            for (
                                let i =
                                    global.BUNEXT_HMR_CONTROLLERS.length - 1;
                                i >= 0;
                                i--
                            ) {
                                const controller =
                                    global.BUNEXT_HMR_CONTROLLERS[i];
                                try {
                                    controller?.controller?.enqueue(
                                        `event: update\ndata: ${JSON.stringify({ reload: true })}\n\n`,
                                    );
                                } catch {
                                    global.BUNEXT_HMR_CONTROLLERS.splice(i, 1);
                                }
                            }
                        }
                    }
                    return;
                }

                const is_file_of_interest =
                    Boolean(filename.match(target_files_match)) ||
                    file_stat?.isDirectory();

                if (!is_file_of_interest) {
                    return;
                }

                if (!filename.match(/^src\/pages\/|\.css$/))
                    return reloadWatcher();
                if (checkExcludedPatterns({ path: filename }))
                    return reloadWatcher();
                if (filename.match(/ /)) return reloadWatcher();

                if (global.BUNEXT_RECOMPILING) return;

                owns_recompile = true;
                const action = does_file_exist ? "created" : "deleted";
                const type = filename.match(/\.css$/)
                    ? "Sylesheet"
                    : file_stat?.isDirectory()
                      ? "Directory"
                      : filename.match(/\/pages\/api\//)
                        ? "API Route"
                        : "Page";

                await fullRebuild({
                    msg: `${type} ${action}: ${filename}. Rebuilding ...`,
                });
            } catch (error) {
                log.error(`Watcher rebuild failed: ${error}`);
            } finally {
                if (owns_recompile) {
                    global.BUNEXT_RECOMPILING = false;
                    global.BUNEXT_IS_SERVER_COMPONENT = false;
                }
            }
        },
    );

    global.BUNEXT_PAGES_SRC_WATCHER = pages_src_watcher;
}

function reloadWatcher() {
    if (global.BUNEXT_PAGES_SRC_WATCHER) {
        global.BUNEXT_PAGES_SRC_WATCHER.close();
        watcherEsbuildCTX();
    }
}
