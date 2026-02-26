import { Command } from "commander";
import grabConfig from "../../src/functions/grab-config";
import startServer from "../../src/functions/server/start-server";
import init from "../../src/functions/init";
import type { BunextConfig } from "../../src/types";

export default function () {
    return new Command("dev")
        .description("Run development server")
        .action(async () => {
            console.log(`Running development server ...`);

            await init();

            const config: BunextConfig = (await grabConfig()) || {};

            global.CONFIG = {
                ...config,
                development: true,
            };

            await startServer({ dev: true });
        });
}
