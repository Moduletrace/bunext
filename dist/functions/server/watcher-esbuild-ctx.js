import { watch, existsSync, statSync } from "fs";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import { log } from "../../utils/log";
import allPagesESBuildContextBundler from "../bundler/all-pages-esbuild-context-bundler";
import serverPostBuildFn from "./server-post-build-fn";
const { ROOT_DIR } = grabDirNames();
export default async function watcherEsbuildCTX() {
    const pages_src_watcher = watch(ROOT_DIR, {
        recursive: true,
        persistent: true,
    }, async (event, filename) => {
        // log.info(`event: ${event}`);
        // log.info(`filename: ${filename}`);
        if (!filename)
            return;
        if (filename.match(/^\.\w+/)) {
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
        const excluded_match = /node_modules\/|^public\/|^\.bunext\/|^\.git\/|^dist\/|bun\.lockb$/;
        if (filename.match(excluded_match))
            return;
        if (filename.match(/bunext.config\.ts/)) {
            await fullRebuild({
                msg: `bunext.config.ts file changed. Rebuilding server ...`,
            });
            return;
        }
        const target_files_match = /\.(tsx?|jsx?|css)$/;
        if (event !== "rename") {
            if (filename.match(target_files_match)) {
                if (global.RECOMPILING)
                    return;
                global.RECOMPILING = true;
                await global.BUNDLER_CTX?.rebuild();
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
            return;
        if (filename.match(/\/(--|\()/))
            return;
        if (filename.match(/ /))
            return;
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
async function fullRebuild(params) {
    try {
        const { msg } = params || {};
        global.RECOMPILING = true;
        if (msg) {
            log.watch(msg);
        }
        global.ROUTER.reload();
        await global.BUNDLER_CTX?.dispose();
        global.BUNDLER_CTX = undefined;
        global.BUNDLER_CTX_MAP = {};
        allPagesESBuildContextBundler({
            post_build_fn: serverPostBuildFn,
        });
    }
    catch (error) {
        log.error(error);
    }
    if (global.PAGES_SRC_WATCHER) {
        global.PAGES_SRC_WATCHER.close();
        watcherEsbuildCTX();
    }
}
