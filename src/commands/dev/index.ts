import { Command } from "commander";
import grabConfig from "../../functions/grab-config";
import startServer from "../../functions/server/start-server";
import init from "../../functions/init";
import type { BunextConfig } from "../../types";
import { log } from "../../utils/log";

export default function () {
    return new Command("dev")
        .description("Run development server")
        .action(async () => {
            log.banner();
            log.info("Running development server ...");

            await init();

            const config: BunextConfig = (await grabConfig()) || {};

            global.CONFIG = {
                ...config,
                development: true,
            };

            await startServer({ dev: true });
        });
}
