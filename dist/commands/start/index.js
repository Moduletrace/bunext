import { Command } from "commander";
import grabConfig from "../../functions/grab-config";
import startServer from "../../functions/server/start-server";
import init from "../../functions/init";
import { log } from "../../utils/log";
export default function () {
    return new Command("start")
        .description("Start production server")
        .action(async () => {
        log.banner();
        log.info("Starting production server ...");
        process.env.NODE_ENV = "production";
        await init();
        const config = await grabConfig();
        global.CONFIG = { ...config };
        await startServer();
    });
}
