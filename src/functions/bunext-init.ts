import type {
    BundlerCTXMap,
    BunextConfig,
    GlobalHMRControllerObject,
    PageFiles,
} from "../types";
import type { FileSystemRouter, Server } from "bun";
import grabDirNames, { type DirNames } from "../utils/grab-dir-names";
import init from "./init";
import isDevelopment from "../utils/is-development";
import { log } from "../utils/log";
import cron from "./server/cron";
import type { BuildContext } from "esbuild";
import allPagesESBuildContextBundler from "./bundler/all-pages-esbuild-context-bundler";
import serverPostBuildFn from "./server/server-post-build-fn";
import reactModulesBundler from "./bundler/react-modules-bundler";
import grabConstants from "../utils/grab-constants";
import watcherEsbuildCTX from "./server/watcher-esbuild-ctx";
import type { FSWatcher } from "fs";

/**
 * # Declare Global Variables
 */
declare global {
    var BUNEXT_CONFIG: BunextConfig;
    var BUNEXT_SERVER: Server<any> | undefined;
    var BUNEXT_RECOMPILING: boolean;
    var BUNEXT_BUILDING_SSR: boolean;
    var BUNEXT_IS_SERVER_COMPONENT: boolean;
    var BUNEXT_WATCHER_TIMEOUT: any;
    var BUNEXT_ROUTER: FileSystemRouter;
    var BUNEXT_HMR_CONTROLLERS: GlobalHMRControllerObject[];
    var BUNEXT_LAST_BUILD_TIME: number;
    var BUNEXT_BUNDLER_CTX_MAP: { [k: string]: BundlerCTXMap };
    var BUNEXT_SSR_BUNDLER_CTX_MAP: { [k: string]: BundlerCTXMap };
    // var BUNEXT_API_ROUTES_BUNDLER_CTX_MAP: { [k: string]: BundlerCTXMap };
    var BUNEXT_BUNDLER_REBUILDS: 0;
    var BUNEXT_PAGES_SRC_WATCHER: FSWatcher | undefined;
    var BUNEXT_CURRENT_VERSION: string | undefined;
    var BUNEXT_PAGE_FILES: PageFiles[];
    var BUNEXT_ROOT_FILE_UPDATED: boolean;
    var BUNEXT_SKIPPED_BROWSER_MODULES: Set<string>;
    var BUNEXT_BUNDLER_CTX: BuildContext | undefined;
    var BUNEXT_SSR_BUNDLER_CTX: BuildContext | undefined;
    // var BUNEXT_API_ROUTES_BUNDLER_CTX: BuildContext | undefined;
    var BUNEXT_DIR_NAMES: DirNames;
    var BUNEXT_REACT_IMPORTS_MAP: { imports: Record<string, string> };
    var BUNEXT_REACT_DOM_SERVER: any;
    var BUNEXT_REACT_DOM_MODULE_CACHE: Map<string, { main: any; css: string }>;
    var BUNEXT_BUNDLER_CTX_DISPOSED: boolean | undefined;
    var BUNEXT_SSR_BUNDLER_CTX_DISPOSED: boolean | undefined;
    var BUNEXT_REBUILD_RETRIES: number;
    var BUNEXT_IS_404_PAGE: boolean;
    var BUNEXT_CONSTANTS: ReturnType<typeof grabConstants>;
    var BUNEXT_MAIN_CTX_BUILD_STARTS: number;
}

const dirNames = grabDirNames();
const { PAGES_DIR } = dirNames;

type Params = {
    build_only?: boolean;
};

export default async function bunextInit(params?: Params) {
    global.BUNEXT_HMR_CONTROLLERS = [];
    global.BUNEXT_BUNDLER_CTX_MAP = {};
    global.BUNEXT_SSR_BUNDLER_CTX_MAP = {};
    // global.BUNEXT_API_ROUTES_BUNDLER_CTX_MAP = {};
    global.BUNEXT_BUNDLER_REBUILDS = 0;
    global.BUNEXT_REBUILD_RETRIES = 0;
    global.BUNEXT_PAGE_FILES = [];
    global.BUNEXT_SKIPPED_BROWSER_MODULES = new Set<string>();
    global.BUNEXT_DIR_NAMES = dirNames;
    global.BUNEXT_REACT_IMPORTS_MAP = { imports: {} };
    global.BUNEXT_REACT_DOM_MODULE_CACHE = new Map<string, any>();
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
    } else if (is_dev) {
        log.build(`Building Modules ...`);
        await allPagesESBuildContextBundler({
            post_build_fn: async () => {
                await serverPostBuildFn();
            },
        });
        watcherEsbuildCTX();
    } else {
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
