import { watch, existsSync, statSync } from "fs";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import fullRebuild from "./full-rebuild";
import { AppData } from "../../data/app-data";
import checkExcludedPatterns from "../../utils/check-excluded-patterns";
import pagesSSRBundler from "../bundler/pages-ssr-bundler";
const { ROOT_DIR } = grabDirNames();
export default async function watcherEsbuildCTX() {
    const pages_src_watcher = watch(ROOT_DIR, {
        recursive: true,
        persistent: true,
    }, async (event, filename) => {
        if (!filename)
            return;
        if (filename.match(/^\.\w+/)) {
            return;
        }
        if (global.BUNDLER_CTX_DISPOSED) {
            await fullRebuild({ msg: `Restarting Bundler ...` });
            global.BUNDLER_CTX_DISPOSED = false;
        }
        if (global.SSR_BUNDLER_CTX_DISPOSED) {
            pagesSSRBundler();
        }
        if (filename.endsWith(AppData["BunextTmpFileExt"])) {
            return;
        }
        const full_file_path = path.join(ROOT_DIR, filename);
        const does_file_exist = existsSync(full_file_path);
        const file_stat = does_file_exist
            ? statSync(full_file_path)
            : undefined;
        if (full_file_path.match(/\/styles$/)) {
            global.RECOMPILING = true;
            await Bun.sleep(1000);
            await fullRebuild({
                msg: `Detected new \`styles\` directory. Rebuilding ...`,
            });
            return;
        }
        const excluded_match = /node_modules\/|^public\/|^\.bunext\/|^\.git\/|^\.?dist\/|bun\.lockb$/;
        if (filename.match(excluded_match))
            return;
        if (filename.match(/bunext.config\.ts/)) {
            await fullRebuild({
                msg: `bunext.config.ts file changed. Rebuilding server ...`,
            });
            return;
        }
        const target_files_match = /\.(tsx?|jsx?|css)$/;
        // const rebuild_skip_paths = /\/pages\/api\//;
        if (event !== "rename") {
            if (filename.match(target_files_match)) {
                if (global.RECOMPILING)
                    return;
                global.RECOMPILING = true;
                if (filename.match(/.*\.server\.tsx?/)) {
                    global.IS_SERVER_COMPONENT = true;
                }
                if (global.BUNDLER_CTX) {
                    try {
                        await global.BUNDLER_CTX.rebuild();
                    }
                    catch (error) {
                        console.log(`ESBUILD Rebuild Error =>`, error);
                    }
                }
                if (filename.match(/(404|500)\.tsx?/)) {
                    for (let i = global.HMR_CONTROLLERS.length - 1; i >= 0; i--) {
                        const controller = global.HMR_CONTROLLERS[i];
                        controller?.controller?.enqueue(`event: update\ndata: ${JSON.stringify({ reload: true })}\n\n`);
                    }
                }
            }
            return;
        }
        const is_file_of_interest = Boolean(filename.match(target_files_match)) ||
            file_stat?.isDirectory();
        if (!is_file_of_interest) {
            return;
        }
        if (!filename.match(/^src\/pages\/|\.css$/))
            return reloadWatcher();
        if (checkExcludedPatterns({ path: filename }))
            return reloadWatcher();
        if (filename.match(/ /))
            return reloadWatcher();
        if (global.RECOMPILING)
            return;
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
    });
    global.PAGES_SRC_WATCHER = pages_src_watcher;
}
function reloadWatcher() {
    if (global.PAGES_SRC_WATCHER) {
        global.PAGES_SRC_WATCHER.close();
        watcherEsbuildCTX();
    }
}
