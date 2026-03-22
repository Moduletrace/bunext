import { Command } from "commander";
import startServer from "../../functions/server/start-server";
import { log } from "../../utils/log";
import bunextInit from "../../functions/bunext-init";
import rewritePagesModule from "../../utils/rewrite-pages-module";
import { execSync } from "child_process";
import grabDirNames from "../../utils/grab-dir-names";

const { HYDRATION_DST_DIR, BUNX_CWD_PAGES_REWRITE_DIR } = grabDirNames();

export default function () {
    return new Command("dev")
        .description("Run development server")
        .action(async () => {
            process.env.NODE_ENV == "development";

            log.info("Running development server ...");

            try {
                execSync(`rm -rf ${HYDRATION_DST_DIR}`);
                execSync(`rm -rf ${BUNX_CWD_PAGES_REWRITE_DIR}`);
            } catch (error) {}

            await rewritePagesModule();
            await bunextInit();

            await startServer();
        });
}
