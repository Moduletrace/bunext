import { Command } from "commander";
import startServer from "../../functions/server/start-server";
import { log } from "../../utils/log";
import bunextInit from "../../functions/bunext-init";

export default function () {
    return new Command("start")
        .description("Start production server")
        .action(async () => {
            process.env.NODE_ENV = "production";
            log.info("Starting production server ...");

            await bunextInit();

            await startServer();
        });
}
