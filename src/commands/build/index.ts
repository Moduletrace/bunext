import { Command } from "commander";
import grabConfig from "../../functions/grab-config";
import init from "../../functions/init";
import type { BunextConfig } from "../../types";
import allPagesBundler from "../../functions/bundler/all-pages-bundler";
import { log } from "../../utils/log";

export default function () {
    return new Command("build")
        .description("Build Project")
        .action(async () => {
            log.banner();
            log.build("Building Project ...");

            process.env.NODE_ENV = "production";

            await init();

            const config: BunextConfig = (await grabConfig()) || {};

            global.CONFIG = {
                ...config,
                development: true,
            };

            allPagesBundler({
                exit_after_first_build: true,
            });
        });
}
