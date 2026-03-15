import { Command } from "commander";
import grabConfig from "../../src/functions/grab-config";
import startServer from "../../src/functions/server/start-server";
import init from "../../src/functions/init";
import type { BunextConfig } from "../../src/types";
import grabAllPages from "../../src/utils/grab-all-pages";
import allPagesBundler from "../../src/functions/bundler/all-pages-bundler";

export default function () {
    return new Command("build")
        .description("Build Project")
        .action(async () => {
            console.log(`Building Project ...`);

            await init();

            const config: BunextConfig = (await grabConfig()) || {};

            global.CONFIG = {
                ...config,
                development: true,
            };

            allPagesBundler();
        });
}
