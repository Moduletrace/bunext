import { Command } from "commander";
import startServer from "../../functions/server/start-server";
import { log } from "../../utils/log";
import bunextInit from "../../functions/bunext-init";
import allPagesBunBundler from "../../functions/bundler/all-pages-bun-bundler";

export default function () {
    return new Command("start")
        .description("Start production server")
        .action(async () => {
            log.info("Starting production server ...");

            await bunextInit();

            await allPagesBunBundler();

            await startServer();
        });
}
