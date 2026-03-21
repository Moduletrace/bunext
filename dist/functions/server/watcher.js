import { watch, existsSync } from "fs";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import rebuildBundler from "./rebuild-bundler";
import { log } from "../../utils/log";
const { ROOT_DIR } = grabDirNames();
export default function watcher() {
    const pages_src_watcher = watch(ROOT_DIR, {
        recursive: true,
        persistent: true,
    }, async (event, filename) => {
        if (!filename)
            return;
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
            if (filename.match(target_files_match) && global.BUNDLER_CTX) {
                if (global.RECOMPILING)
                    return;
                global.RECOMPILING = true;
                await global.BUNDLER_CTX.rebuild();
            }
            return;
        }
        if (!filename.match(target_files_match)) {
            return;
        }
        if (!filename.match(/^src\/pages\//))
            return;
        if (filename.match(/\/(--|\()/))
            return;
        if (global.RECOMPILING)
            return;
        const fullPath = path.join(ROOT_DIR, filename);
        const action = existsSync(fullPath) ? "created" : "deleted";
        await fullRebuild({
            msg: `Page ${action}: ${filename}. Rebuilding ...`,
        });
    });
    global.PAGES_SRC_WATCHER = pages_src_watcher;
}
async function fullRebuild({ msg }) {
    try {
        global.RECOMPILING = true;
        if (msg) {
            log.watch(msg);
        }
        await rebuildBundler();
    }
    catch (error) {
        log.error(error);
    }
    finally {
        global.RECOMPILING = false;
    }
    if (global.PAGES_SRC_WATCHER) {
        global.PAGES_SRC_WATCHER.close();
        watcher();
    }
}
