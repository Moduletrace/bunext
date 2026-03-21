import { Command } from "commander";
import allPagesBundler from "../../functions/bundler/all-pages-bundler";
import { log } from "../../utils/log";

export default function () {
    return new Command("build")
        .description("Build Project")
        .action(async () => {
            process.env.NODE_ENV = "production";
            process.env.BUILD = "true";

            log.build("Building Project ...");

            allPagesBundler({
                exit_after_first_build: true,
            });
        });
}
