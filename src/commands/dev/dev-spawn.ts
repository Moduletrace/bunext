import startServer from "../../functions/server/start-server";
import { log } from "../../utils/log";
import bunextInit from "../../functions/bunext-init";
import grabDirNames from "../../utils/grab-dir-names";
import { rmSync } from "fs";

const { HYDRATION_DST_DIR, BUNX_CWD_PAGES_REWRITE_DIR } = grabDirNames();

process.on("uncaughtException", (error) => {
    log.error(`Uncaught exception: ${error}`);
});

process.on("unhandledRejection", (reason) => {
    log.error(`Unhandled rejection: ${reason}`);
});

log.info("Running development server ...");

try {
    rmSync(HYDRATION_DST_DIR, { recursive: true });
    rmSync(BUNX_CWD_PAGES_REWRITE_DIR, { recursive: true });
} catch (error) {}

try {
    await bunextInit();
    await startServer();
} catch (error) {
    log.error(`Failed to start development server: ${error}`);
}
