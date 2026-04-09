import grabDirNames from "../utils/grab-dir-names";
import {} from "fs";
import init from "./init";
import isDevelopment from "../utils/is-development";
import { log } from "../utils/log";
import cron from "./server/cron";
import watcherEsbuildCTX from "./server/watcher-esbuild-ctx";
import allPagesESBuildContextBundler from "./bundler/all-pages-esbuild-context-bundler";
import serverPostBuildFn from "./server/server-post-build-fn";
import reactModulesBundler from "./bundler/react-modules-bundler";
const dirNames = grabDirNames();
const { PAGES_DIR } = dirNames;
export default async function bunextInit() {
    global.HMR_CONTROLLERS = [];
    global.BUNDLER_CTX_MAP = {};
    global.SSR_BUNDLER_CTX_MAP = {};
    global.BUNDLER_REBUILDS = 0;
    global.PAGE_FILES = [];
    global.SKIPPED_BROWSER_MODULES = new Set();
    global.DIR_NAMES = dirNames;
    global.REACT_IMPORTS_MAP = { imports: {} };
    global.REACT_DOM_MODULE_CACHE = new Map();
    log.banner();
    await init();
    await reactModulesBundler();
    const router = new Bun.FileSystemRouter({
        style: "nextjs",
        dir: PAGES_DIR,
    });
    global.ROUTER = router;
    const is_dev = isDevelopment();
    if (is_dev) {
        log.build(`Building Modules ...`);
        await allPagesESBuildContextBundler({
            post_build_fn: serverPostBuildFn,
        });
        // initPages({
        //     log_time: true,
        // });
        watcherEsbuildCTX();
    }
    else {
        log.build(`Building Modules ...`);
        await allPagesESBuildContextBundler();
        // initPages({
        //     log_time: true,
        // });
        cron();
    }
}
