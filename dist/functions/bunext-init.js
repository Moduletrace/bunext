import ora, {} from "ora";
import grabDirNames from "../utils/grab-dir-names";
import { readFileSync } from "fs";
import init from "./init";
import isDevelopment from "../utils/is-development";
import allPagesBundler from "./bundler/all-pages-bundler";
import serverPostBuildFn from "./server/server-post-build-fn";
import watcher from "./server/watcher";
import EJSON from "../utils/ejson";
import { log } from "../utils/log";
import cron from "./server/cron";
export default async function bunextInit() {
    global.ORA_SPINNER = ora();
    global.ORA_SPINNER.clear();
    global.HMR_CONTROLLERS = [];
    global.IS_FIRST_BUNDLE_READY = false;
    global.BUNDLER_REBUILDS = 0;
    global.PAGE_FILES = [];
    await init();
    log.banner();
    const { PAGES_DIR, HYDRATION_DST_DIR_MAP_JSON_FILE } = grabDirNames();
    const router = new Bun.FileSystemRouter({
        style: "nextjs",
        dir: PAGES_DIR,
    });
    global.ROUTER = router;
    const is_dev = isDevelopment();
    if (is_dev) {
        await allPagesBundler({
            watch: true,
            post_build_fn: serverPostBuildFn,
        });
        watcher();
    }
    else {
        const artifacts = EJSON.parse(readFileSync(HYDRATION_DST_DIR_MAP_JSON_FILE, "utf-8"));
        if (!artifacts?.[0]) {
            log.error("Please build first.");
            process.exit(1);
        }
        global.BUNDLER_CTX_MAP = artifacts;
        global.IS_FIRST_BUNDLE_READY = true;
        cron();
    }
    let bundle_ready_retries = 0;
    const MAX_BUNDLE_READY_RETRIES = 10;
    while (!global.IS_FIRST_BUNDLE_READY) {
        if (bundle_ready_retries > MAX_BUNDLE_READY_RETRIES) {
            log.error("Couldn't grab first bundle for dev environment");
            process.exit(1);
        }
        bundle_ready_retries++;
        await Bun.sleep(500);
    }
    /**
     * First Rebuild to Avoid errors
     */
    if (is_dev && global.BUNDLER_CTX) {
        await global.BUNDLER_CTX.rebuild();
    }
}
