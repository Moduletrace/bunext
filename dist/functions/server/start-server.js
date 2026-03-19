import _ from "lodash";
import AppNames from "../../utils/grab-app-names";
import { log } from "../../utils/log";
import allPagesBundler from "../bundler/all-pages-bundler";
import serverParamsGen from "./server-params-gen";
import watcher from "./watcher";
import serverPostBuildFn from "./server-post-build-fn";
import grabDirNames from "../../utils/grab-dir-names";
import EJSON from "../../utils/ejson";
import { readFileSync } from "fs";
import cron from "./cron";
const { HYDRATION_DST_DIR_MAP_JSON_FILE } = grabDirNames();
export default async function startServer(params) {
    const { name } = AppNames;
    const serverParams = await serverParamsGen();
    if (params?.dev) {
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
    const server = Bun.serve(serverParams);
    global.SERVER = server;
    log.server(`http://localhost:${server.port}`);
    return server;
}
