import chokidar from "chokidar";
import path from "path";
import { existsSync, statSync } from "fs";
import grabDirNames from "../../utils/grab-dir-names";
import fullRebuild from "./full-rebuild";
import { AppData } from "../../data/app-data";
import checkExcludedPatterns from "../../utils/check-excluded-patterns";
import pagesSSRBundler from "../bundler/pages-ssr-bundler";
const { ROOT_DIR, BUNX_BUNDLER_ERROR_EXIT_FILE } = grabDirNames();
export default async function chokadirWatcherEsbuildCTX() {
    // Define ignored patterns directly in Chokidar for better performance
    const watcher = chokidar.watch(ROOT_DIR, {
        ignored: [
            /(^|[\/\\])\../, // ignore dotfiles
            /node_modules/,
            /public/,
            /\.bunext/,
            /\.git/,
            /dist/,
            /bun\.lockb/,
            (path) => path.endsWith(AppData["BunextTmpFileExt"]),
        ],
        persistent: true,
        ignoreInitial: true,
        depth: 99,
    });
    const handleEvent = async (event, filePath) => {
        const filename = path.relative(ROOT_DIR, filePath);
        if (existsSync(BUNX_BUNDLER_ERROR_EXIT_FILE)) {
            await fullRebuild();
            return;
        }
        if (global.BUNDLER_CTX_DISPOSED) {
            await fullRebuild({ msg: `Restarting Bundler ...` });
        }
        if (global.SSR_BUNDLER_CTX_DISPOSED) {
            pagesSSRBundler();
        }
        if (filename.match(/\/styles$/) || filename === "styles") {
            global.RECOMPILING = true;
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
                if (global.RECOMPILING)
                    return;
                global.RECOMPILING = true;
                if (filename.match(/.*\.server\.tsx?/)) {
                    global.IS_SERVER_COMPONENT = true;
                }
                if (global.BUNDLER_CTX) {
                    await global.BUNDLER_CTX.rebuild();
                }
                // HMR for error pages
                if (filename.match(/(404|500)\.tsx?/)) {
                    global.HMR_CONTROLLERS.forEach((controller) => {
                        controller?.controller?.enqueue(`event: update\ndata: ${JSON.stringify({ reload: true })}\n\n`);
                    });
                }
            }
            return;
        }
        // Handle Structural Changes (Add/Delete)
        if (["add", "unlink", "addDir", "unlinkDir"].includes(event)) {
            const is_file_of_interest = !!filename.match(target_files_match) || event.includes("Dir");
            if (!is_file_of_interest)
                return;
            // Validation logic
            if (!filename.match(/^src\/pages\/|\.css$/) ||
                checkExcludedPatterns({ path: filename }) ||
                filename.includes(" ")) {
                // With chokidar, you rarely need to "reload" the whole watcher.
                // But we keep the logic for consistency.
                return reloadWatcher();
            }
            if (global.RECOMPILING)
                return;
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
    };
    watcher
        .on("add", (path) => handleEvent("add", path))
        .on("change", (path) => handleEvent("change", path))
        .on("unlink", (path) => handleEvent("unlink", path))
        .on("addDir", (path) => handleEvent("addDir", path))
        .on("unlinkDir", (path) => handleEvent("unlinkDir", path));
    // global.PAGES_SRC_WATCHER = watcher;
}
function reloadWatcher() {
    if (global.PAGES_SRC_WATCHER) {
        global.PAGES_SRC_WATCHER.close();
        chokadirWatcherEsbuildCTX();
    }
}
