import { Command } from "commander";
import grabConfig from "../../src/functions/grab-config";
import startServer from "../../src/functions/server/start-server";
import init from "../../src/functions/init";

export default function () {
    return new Command("start")
        .description("Start production server")
        .action(async () => {
            console.log(`Starting production server ...`);

            await init();

            const config = await grabConfig();

            global.CONFIG = { ...config };

            await startServer();
        });
}
