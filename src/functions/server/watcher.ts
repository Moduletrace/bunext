import { watch, existsSync } from "fs";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import rebuildBundler from "./rebuild-bundler";
import { log } from "../../utils/log";

const { ROOT_DIR } = grabDirNames();

export default async function watcher() {
    const pages_src_watcher = watch(
        ROOT_DIR,
        {
            recursive: true,
            persistent: true,
        },
        async (event, filename) => {
            if (!filename) return;

            const full_file_path = path.join(ROOT_DIR, filename);

            if (full_file_path.match(/\/styles$/)) {
                global.RECOMPILING = true;
                await Bun.sleep(1000);
                await fullRebuild({
                    msg: `Detected new \`styles\` directory. Rebuilding ...`,
                });
                return;
            }

            const excluded_match =
                /node_modules\/|^public\/|^\.bunext\/|^\.git\/|^dist\/|bun\.lockb$/;

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
                    if (global.RECOMPILING) return;
                    global.RECOMPILING = true;
                    await fullRebuild();
                }
                return;
            }

            const is_file_of_interest = Boolean(
                filename.match(target_files_match),
            );

            if (!is_file_of_interest) {
                return;
            }

            if (!filename.match(/^src\/pages\/|\.css$/)) return;
            if (filename.match(/\/(--|\(| )/)) return;

            if (global.RECOMPILING) return;

            const action = existsSync(full_file_path) ? "created" : "deleted";
            const type = filename.match(/\.css$/) ? "Sylesheet" : "Page";

            await fullRebuild({
                msg: `${type} ${action}: ${filename}. Rebuilding ...`,
            });
        },
    );

    global.PAGES_SRC_WATCHER = pages_src_watcher;
}

async function fullRebuild(params?: { msg?: string }) {
    try {
        const { msg } = params || {};

        global.RECOMPILING = true;

        const target_file_paths = global.HMR_CONTROLLERS.map(
            (hmr) => hmr.target_map?.local_path,
        ).filter((f) => typeof f == "string");

        if (msg) {
            log.watch(msg);
        }

        await rebuildBundler({ target_file_paths });
    } catch (error: any) {
        log.error(error);
    } finally {
        global.RECOMPILING = false;
    }

    if (global.PAGES_SRC_WATCHER) {
        global.PAGES_SRC_WATCHER.close();
        watcher();
    }
}
