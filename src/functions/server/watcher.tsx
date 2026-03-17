import { watch, existsSync } from "fs";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import rebuildBundler from "./rebuild-bundler";

const { SRC_DIR } = grabDirNames();

const PAGE_FILE_RE = /\.(tsx?|jsx?|css)$/;

export default function watcher() {
    watch(
        SRC_DIR,
        {
            recursive: true,
            persistent: true,
        },
        async (event, filename) => {
            if (!filename) return;
            const file_path = path.join(SRC_DIR, filename);
            // if (!PAGE_FILE_RE.test(filename)) return;

            // "change" events (file content modified) are already handled by
            // esbuild's internal ctx.watch(). Only "rename" (create or delete)
            // requires a full rebuild because entry points have changed.
            if (event !== "rename") return;

            if (global.RECOMPILING) return;

            const fullPath = path.join(SRC_DIR, filename);
            const action = existsSync(fullPath) ? "created" : "deleted";

            try {
                global.RECOMPILING = true;

                console.log(`Page ${action}: ${filename}. Rebuilding ...`);

                await rebuildBundler();
            } catch (error: any) {
                console.error(error);
            } finally {
                global.RECOMPILING = false;
            }
        },
    );
}
