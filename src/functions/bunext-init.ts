import ora, { type Ora } from "ora";
import type {
    BundlerCTXMap,
    BunextConfig,
    GlobalHMRControllerObject,
    PageFiles,
} from "../types";
import type { FileSystemRouter, Server } from "bun";
import grabDirNames from "../utils/grab-dir-names";
import { readFileSync, type FSWatcher } from "fs";
import init from "./init";
import isDevelopment from "../utils/is-development";
import allPagesBundler from "./bundler/all-pages-bundler";
import watcher from "./server/watcher";
import { log } from "../utils/log";
import cron from "./server/cron";
import EJSON from "../utils/ejson";
import allPagesBunBundler from "./bundler/all-pages-bun-bundler";

/**
 * # Declare Global Variables
 */
declare global {
    var ORA_SPINNER: Ora;
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
    // var BUNDLER_CTX: BuildContext | undefined;
}

const { PAGES_DIR, HYDRATION_DST_DIR_MAP_JSON_FILE } = grabDirNames();

export default async function bunextInit() {
    global.ORA_SPINNER = ora();
    global.ORA_SPINNER.clear();
    global.HMR_CONTROLLERS = [];
    global.BUNDLER_CTX_MAP = {};
    global.BUNDLER_REBUILDS = 0;
    global.PAGE_FILES = [];

    await init();
    log.banner();

    const router = new Bun.FileSystemRouter({
        style: "nextjs",
        dir: PAGES_DIR,
    });

    global.ROUTER = router;

    const is_dev = isDevelopment();

    if (is_dev) {
        // await allPagesBundler();
        await allPagesBunBundler();
        watcher();
    } else {
        const artifacts = EJSON.parse(
            readFileSync(HYDRATION_DST_DIR_MAP_JSON_FILE, "utf-8"),
        ) as { [k: string]: BundlerCTXMap } | undefined;
        if (!artifacts) {
            log.error("Please build first.");
            process.exit(1);
        }
        global.BUNDLER_CTX_MAP = artifacts;
        cron();
    }
}
