import { watch } from "fs";
import grabDirNames from "../../utils/grab-dir-names";
import grabPageName from "../../utils/grab-page-name";
import path from "path";
import serverParamsGen from "./server-params-gen";
import bundle from "../../utils/bundle";
import grabRouter from "../../utils/grab-router";
import allPagesBundler from "../bundler/all-pages-bundler";
const { ROOT_DIR, BUNX_HYDRATION_SRC_DIR, HYDRATION_DST_DIR, PAGES_DIR } = grabDirNames();
export default function watcher() {
    watch(ROOT_DIR, { recursive: true, persistent: true }, async (event, filename) => {
        if (global.RECOMPILING)
            return;
        if (!filename)
            return;
        if (filename.match(/ /))
            return;
        if (filename.match(/^node_modules\//))
            return;
        if (filename.match(/\.bunext|\/?public\//))
            return;
        if (!filename.match(/\.(tsx|ts|css|js|jsx)$/))
            return;
        if (filename.match(/\/pages\//)) {
            try {
                clearTimeout(global.WATCHER_TIMEOUT);
                global.RECOMPILING = true;
                await allPagesBundler();
                global.LAST_BUILD_TIME = Date.now();
                for (const controller of global.HMR_CONTROLLERS) {
                    controller.enqueue(`event: update\ndata: reload\n\n`);
                }
                global.RECOMPILING = false;
            }
            catch (error) {
                console.error(`Bundler ERROR => ${error.message.substring(0, 120)} ...`);
            }
            // if (event == "change") {
            // } else if (event == "rename") {
            //     await reloadServer();
            // }
        }
        else if (filename.match(/\.(js|ts|tsx|jsx)$/)) {
            clearTimeout(global.WATCHER_TIMEOUT);
            await reloadServer();
        }
    });
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
