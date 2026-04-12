import type {
    BundlerCTXMap,
    BunextConfig,
    GlobalHMRControllerObject,
    PageFiles,
} from "../types";
import type { FileSystemRouter, Server } from "bun";
import grabDirNames from "../utils/grab-dir-names";
import { type FSWatcher } from "fs";
import init from "./init";
import isDevelopment from "../utils/is-development";
import { log } from "../utils/log";
import cron from "./server/cron";
import type { BuildContext } from "esbuild";
import watcherEsbuildCTX from "./server/watcher-esbuild-ctx";
import allPagesESBuildContextBundler from "./bundler/all-pages-esbuild-context-bundler";
import serverPostBuildFn from "./server/server-post-build-fn";
import reactModulesBundler from "./bundler/react-modules-bundler";
import grabConstants from "../utils/grab-constants";

/**
 * # Declare Global Variables
 */
declare global {
    var CONFIG: BunextConfig;
    var SERVER: Server<any> | undefined;
    var RECOMPILING: boolean;
    var BUILDING_SSR: boolean;
    var IS_SERVER_COMPONENT: boolean;
    var WATCHER_TIMEOUT: any;
    var ROUTER: FileSystemRouter;
    var HMR_CONTROLLERS: GlobalHMRControllerObject[];
    var LAST_BUILD_TIME: number;
    var BUNDLER_CTX_MAP: { [k: string]: BundlerCTXMap };
    var SSR_BUNDLER_CTX_MAP: { [k: string]: BundlerCTXMap };
    // var API_ROUTES_BUNDLER_CTX_MAP: { [k: string]: BundlerCTXMap };
    var BUNDLER_REBUILDS: 0;
    var PAGES_SRC_WATCHER: FSWatcher | undefined;
    var CURRENT_VERSION: string | undefined;
    var PAGE_FILES: PageFiles[];
    var ROOT_FILE_UPDATED: boolean;
    var SKIPPED_BROWSER_MODULES: Set<string>;
    var BUNDLER_CTX: BuildContext | undefined;
    var SSR_BUNDLER_CTX: BuildContext | undefined;
    // var API_ROUTES_BUNDLER_CTX: BuildContext | undefined;
    var DIR_NAMES: ReturnType<typeof grabDirNames>;
    var REACT_IMPORTS_MAP: { imports: Record<string, string> };
    var REACT_DOM_SERVER: any;
    var REACT_DOM_MODULE_CACHE: Map<string, { main: any; css: string }>;
    var BUNDLER_CTX_DISPOSED: boolean | undefined;
    var REBUILD_RETRIES: number;
    var IS_404_PAGE: boolean;
    var CONSTANTS: ReturnType<typeof grabConstants>;
}

const dirNames = grabDirNames();
const { PAGES_DIR } = dirNames;

export default async function bunextInit() {
    global.HMR_CONTROLLERS = [];
    global.BUNDLER_CTX_MAP = {};
    global.SSR_BUNDLER_CTX_MAP = {};
    // global.API_ROUTES_BUNDLER_CTX_MAP = {};
    global.BUNDLER_REBUILDS = 0;
    global.REBUILD_RETRIES = 0;
    global.PAGE_FILES = [];
    global.SKIPPED_BROWSER_MODULES = new Set<string>();
    global.DIR_NAMES = dirNames;
    global.REACT_IMPORTS_MAP = { imports: {} };
    global.REACT_DOM_MODULE_CACHE = new Map<string, any>();

    log.banner();

    await init();

    global.CONSTANTS = grabConstants();

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
            post_build_fn: () => {
                serverPostBuildFn();
            },
        });
        watcherEsbuildCTX();
    } else {
        log.build(`Building Modules ...`);
        await allPagesESBuildContextBundler();
        cron();
    }
}
