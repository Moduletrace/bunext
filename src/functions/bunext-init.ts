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

/**
 * # Declare Global Variables
 */
declare global {
    var CONFIG: BunextConfig;
    var SERVER: Server<any> | undefined;
    var RECOMPILING: boolean;
    var WATCHER_TIMEOUT: any;
    var ROUTER: FileSystemRouter;
    var HMR_CONTROLLERS: GlobalHMRControllerObject[];
    var LAST_BUILD_TIME: number;
    var BUNDLER_CTX_MAP: { [k: string]: BundlerCTXMap } | undefined;
    var BUNDLER_REBUILDS: 0;
    var PAGES_SRC_WATCHER: FSWatcher | undefined;
    var CURRENT_VERSION: string | undefined;
    var PAGE_FILES: PageFiles[];
    var ROOT_FILE_UPDATED: boolean;
    var SKIPPED_BROWSER_MODULES: Set<string>;
    var BUNDLER_CTX: BuildContext | undefined;
    var DIR_NAMES: ReturnType<typeof grabDirNames>;
}

const dirNames = grabDirNames();
const { PAGES_DIR } = dirNames;

export default async function bunextInit() {
    global.HMR_CONTROLLERS = [];
    global.BUNDLER_CTX_MAP = {};
    global.BUNDLER_REBUILDS = 0;
    global.PAGE_FILES = [];
    global.SKIPPED_BROWSER_MODULES = new Set<string>();
    global.DIR_NAMES = dirNames;

    await init();
    log.banner();

    const router = new Bun.FileSystemRouter({
        style: "nextjs",
        dir: PAGES_DIR,
    });

    global.ROUTER = router;

    const is_dev = isDevelopment();

    if (is_dev) {
        watcherEsbuildCTX();
    } else {
        cron();
    }
}
