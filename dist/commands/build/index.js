import { Command } from "commander";
import { log } from "../../utils/log";
import init from "../../functions/init";
// import rewritePagesModule from "../../utils/rewrite-pages-module";
import allPagesBunBundler from "../../functions/bundler/all-pages-bun-bundler";
import grabDirNames from "../../utils/grab-dir-names";
import { rmSync } from "fs";
import allPagesBundler from "../../functions/bundler/all-pages-bundler";
const { HYDRATION_DST_DIR, BUNX_CWD_PAGES_REWRITE_DIR } = grabDirNames();
export default function () {
    return new Command("build")
        .description("Build Project")
        .action(async () => {
        try {
            rmSync(HYDRATION_DST_DIR, { recursive: true });
            rmSync(BUNX_CWD_PAGES_REWRITE_DIR, { recursive: true });
        }
        catch (error) { }
        global.SKIPPED_BROWSER_MODULES = new Set();
        // await rewritePagesModule();
        await init();
        log.banner();
        log.build("Building Project ...");
        await allPagesBunBundler();
        // await allPagesBundler();
    });
}
