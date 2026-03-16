import { Command } from "commander";
import grabConfig from "../../src/functions/grab-config";
import init from "../../src/functions/init";
import type { BunextConfig } from "../../src/types";
import allPagesBundler from "../../src/functions/bundler/all-pages-bundler";

export default function () {
    return new Command("build")
        .description("Build Project")
        .action(async () => {
            console.log(`Building Project ...`);

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
