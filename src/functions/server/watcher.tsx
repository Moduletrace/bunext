import { watch, existsSync } from "fs";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import serverParamsGen from "./server-params-gen";
import allPagesBundler from "../bundler/all-pages-bundler";
import serverPostBuildFn from "./server-post-build-fn";
import refreshRouter from "../../utils/refresh-router";

const { PAGES_DIR } = grabDirNames();

const PAGE_FILE_RE = /\.(tsx?|jsx?)$/;

export default function watcher() {
    watch(
        PAGES_DIR,
        {
            recursive: true,
            persistent: true,
        },
        (event, filename) => {
            if (!filename) return;
            if (!PAGE_FILE_RE.test(filename)) return;

            // "change" events (file content modified) are already handled by
            // esbuild's internal ctx.watch(). Only "rename" (create or delete)
            // requires a full rebuild because entry points have changed.
            if (event !== "rename") return;

            if (global.RECOMPILING) return;

            const fullPath = path.join(PAGES_DIR, filename);
            const action = existsSync(fullPath) ? "created" : "deleted";

            clearTimeout(global.WATCHER_TIMEOUT);
            global.WATCHER_TIMEOUT = setTimeout(async () => {
                try {
                    global.RECOMPILING = true;

                    console.log(`Page ${action}: ${filename}. Rebuilding ...`);

                    await global.BUNDLER_CTX?.dispose();
                    global.BUNDLER_CTX = undefined;

                    await allPagesBundler({
                        watch: true,
                        post_build_fn: serverPostBuildFn,
                    });
                } catch (error: any) {
                    console.error(error);
                } finally {
                    global.RECOMPILING = false;
                }
            }, 150);
        },
    );

    // watch(BUNX_HYDRATION_SRC_DIR, async (event, filename) => {
    //     if (!filename) return;

    //     const targetFile = path.join(BUNX_HYDRATION_SRC_DIR, filename);

    //     await Bun.build({
    //         entrypoints: [targetFile],
    //         outdir: HYDRATION_DST_DIR,
    //         minify: true,
    //         target: "browser",
    //         format: "esm",
    //     });

    //     global.SERVER?.publish("__bun_hmr", "update");

    //     setTimeout(() => {
    //         global.RECOMPILING = false;
    //     }, 200);
    // });

    // watch(HYDRATION_DST_DIR, async (event, filename) => {
    //     const encoder = new TextEncoder();
    //     global.HMR_CONTROLLER?.enqueue(encoder.encode(`event: update\ndata: reload\n\n`));
    //     global.RECOMPILING = false;
    // });

    // let cmd = `bun build`;

    // cmd += ` ${BUNX_HYDRATION_SRC_DIR}/*.tsx --outdir ${HYDRATION_DST_DIR}`;
    // cmd += ` --watch --minify`;

    // execSync(cmd, { stdio: "inherit" });
}

async function reloadServer() {
    const serverParams = await serverParamsGen();

    console.log(`Reloading Server ...`);

    global.SERVER?.stop();
    global.SERVER = Bun.serve(serverParams);
}
