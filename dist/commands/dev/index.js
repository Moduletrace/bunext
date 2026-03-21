import { Command } from "commander";
import startServer from "../../functions/server/start-server";
import { log } from "../../utils/log";
import bunextInit from "../../functions/bunext-init";
export default function () {
    return new Command("dev")
        .description("Run development server")
        .action(async () => {
        process.env.NODE_ENV == "development";
        log.info("Running development server ...");
        await bunextInit();
        await startServer();
    });
}
