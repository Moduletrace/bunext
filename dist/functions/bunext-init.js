import grabDirNames, {} from "../utils/grab-dir-names";
import init from "./init";
import isDevelopment from "../utils/is-development";
import { log } from "../utils/log";
import cron from "./server/cron";
import allPagesESBuildContextBundler from "./bundler/all-pages-esbuild-context-bundler";
import serverPostBuildFn from "./server/server-post-build-fn";
import reactModulesBundler from "./bundler/react-modules-bundler";
import grabConstants from "../utils/grab-constants";
import watcherEsbuildCTX from "./server/watcher-esbuild-ctx";
const dirNames = grabDirNames();
const { PAGES_DIR } = dirNames;
export default async function bunextInit(params) {
    global.BUNEXT_HMR_CONTROLLERS = [];
    global.BUNEXT_BUNDLER_CTX_MAP = {};
    global.BUNEXT_SSR_BUNDLER_CTX_MAP = {};
    // global.BUNEXT_API_ROUTES_BUNDLER_CTX_MAP = {};
    global.BUNEXT_BUNDLER_REBUILDS = 0;
    global.BUNEXT_REBUILD_RETRIES = 0;
    global.BUNEXT_PAGE_FILES = [];
    global.BUNEXT_SKIPPED_BROWSER_MODULES = new Set();
    global.BUNEXT_DIR_NAMES = dirNames;
    global.BUNEXT_REACT_IMPORTS_MAP = { imports: {} };
    global.BUNEXT_REACT_DOM_MODULE_CACHE = new Map();
    global.BUNEXT_MAIN_CTX_BUILD_STARTS = 0;
    await init();
    log.banner();
    global.BUNEXT_CONSTANTS = grabConstants();
    await reactModulesBundler();
    const router = new Bun.FileSystemRouter({
        style: "nextjs",
        dir: PAGES_DIR,
    });
    global.BUNEXT_ROUTER = router;
    const is_dev = isDevelopment();
    if (params?.build_only) {
        log.build(`Building Modules ...`);
        await allPagesESBuildContextBundler();
    }
    else if (is_dev) {
        log.build(`Building Modules ...`);
        await allPagesESBuildContextBundler({
            post_build_fn: async () => {
                await serverPostBuildFn();
            },
        });
        watcherEsbuildCTX();
    }
    else {
        log.build(`Building Modules ...`);
        await allPagesESBuildContextBundler({ start: true });
        cron();
    }
}
// process.on("exit", (code) => {
//     Bun.spawn([process.execPath, ...process.argv.slice(1)], {
//         stdio: ["inherit", "inherit", "inherit"],
//         env: process.env,
//     });
// });
