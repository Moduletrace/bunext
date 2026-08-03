import chokidar from "chokidar";
import path from "path";
import { existsSync } from "fs";
import grabDirNames from "../../utils/grab-dir-names";
import fullRebuild from "./full-rebuild";
import { AppData } from "../../data/app-data";
import checkExcludedPatterns from "../../utils/check-excluded-patterns";
import pagesSSRBundler from "../bundler/pages-ssr-bundler";
import { log } from "../../utils/log";

const { ROOT_DIR, BUNX_BUNDLER_ERROR_EXIT_FILE } = grabDirNames();

export default async function chokadirWatcherEsbuildCTX() {
    const watcher = chokidar.watch(ROOT_DIR, {
        ignored: [
            /(^|[\/\\])\../,
            /node_modules/,
            /public/,
            /\.bunext/,
            /\.git/,
            /dist/,
            /bun\.lockb/,
            (path: string) => path.endsWith(AppData["BunextTmpFileExt"]),
        ],
        persistent: true,
        ignoreInitial: true,
        depth: 99,
    });

    const handleEvent = async (
        event: "add" | "change" | "unlink" | "addDir" | "unlinkDir",
        filePath: string,
    ) => {
        let owns_recompile = false;

        try {
            const filename = path.relative(ROOT_DIR, filePath);

            if (existsSync(BUNX_BUNDLER_ERROR_EXIT_FILE)) {
                await fullRebuild();
                return;
            }

            if (global.BUNEXT_BUNDLER_CTX_DISPOSED) {
                await fullRebuild({ msg: `Restarting Bundler ...` });
            }

            if (global.BUNEXT_SSR_BUNDLER_CTX_DISPOSED) {
                await pagesSSRBundler().catch((error) => {
                    log.error(`SSR Bundler Error: ${error}`);
                });
            }

            if (filename.match(/\/styles$/) || filename === "styles") {
                owns_recompile = true;
                global.BUNEXT_RECOMPILING = true;
                await Bun.sleep(1000);
                await fullRebuild({
                    msg: `Detected new \`styles\` directory. Rebuilding ...`,
                });
                return;
            }

            if (filename.match(/bunext.config\.ts/)) {
                await fullRebuild({
                    msg: `bunext.config.ts file changed. Rebuilding server ...`,
                });
                return;
            }

            const target_files_match = /\.(tsx?|jsx?|css)$/;

            if (event === "change") {
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
                    }
                }
                return;
            }

            if (["add", "unlink", "addDir", "unlinkDir"].includes(event)) {
                const is_file_of_interest =
                    !!filename.match(target_files_match) ||
                    event.includes("Dir");

                if (!is_file_of_interest) return;

                if (
                    !filename.match(/^src\/pages\/|\.css$/) ||
                    checkExcludedPatterns({ path: filename }) ||
                    filename.includes(" ")
                ) {
                    return reloadWatcher();
                }

                if (global.BUNEXT_RECOMPILING) return;

                owns_recompile = true;
                const action = event.startsWith("add") ? "created" : "deleted";
                const type = filename.match(/\.css$/)
                    ? "Stylesheet"
                    : event.includes("Dir")
                      ? "Directory"
                      : filename.match(/\/pages\/api\//)
                        ? "API Route"
                        : "Page";

                await fullRebuild({
                    msg: `${type} ${action}: ${filename}. Rebuilding ...`,
                });
            }
        } catch (error) {
            log.error(`Watcher rebuild failed: ${error}`);
        } finally {
            if (owns_recompile) {
                global.BUNEXT_RECOMPILING = false;
                global.BUNEXT_IS_SERVER_COMPONENT = false;
            }
        }
    };

    watcher
        .on("add", (path) => handleEvent("add", path))
        .on("change", (path) => handleEvent("change", path))
        .on("unlink", (path) => handleEvent("unlink", path))
        .on("addDir", (path) => handleEvent("addDir", path))
        .on("unlinkDir", (path) => handleEvent("unlinkDir", path));
}

function reloadWatcher() {
    if (global.BUNEXT_PAGES_SRC_WATCHER) {
        global.BUNEXT_PAGES_SRC_WATCHER.close();
        chokadirWatcherEsbuildCTX();
    }
}
