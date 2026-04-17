import startServer from "../../functions/server/start-server";
import { log } from "../../utils/log";
import bunextInit from "../../functions/bunext-init";
import grabDirNames from "../../utils/grab-dir-names";
import { rmSync } from "fs";

const { HYDRATION_DST_DIR, BUNX_CWD_PAGES_REWRITE_DIR } = grabDirNames();

log.info("Running development server ...");

try {
    rmSync(HYDRATION_DST_DIR, { recursive: true });
    rmSync(BUNX_CWD_PAGES_REWRITE_DIR, { recursive: true });
} catch (error) {}

await bunextInit();

await startServer();
