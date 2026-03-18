import { watch, existsSync } from "fs";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import rebuildBundler from "./rebuild-bundler";
import { log } from "../../utils/log";

const { SRC_DIR } = grabDirNames();

export default function watcher() {
    watch(
        SRC_DIR,
        {
            recursive: true,
            persistent: true,
        },
        async (event, filename) => {
            if (!filename) return;

            if (event !== "rename") return;

            if (global.RECOMPILING) return;

            const fullPath = path.join(SRC_DIR, filename);
            const action = existsSync(fullPath) ? "created" : "deleted";

            try {
                global.RECOMPILING = true;

                log.watch(`Page ${action}: ${filename}. Rebuilding ...`);

                await rebuildBundler();
            } catch (error: any) {
                log.error(error);
            } finally {
                global.RECOMPILING = false;
            }
        },
    );
}
