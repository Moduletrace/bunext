import { Command } from "commander";
import { log } from "../../utils/log";
import init from "../../functions/init";
import rewritePagesModule from "../../utils/rewrite-pages-module";

export default function () {
    return new Command("rewrite-pages")
        .description("Rewrite pages from src to .bunext dir")
        .action(async () => {
            process.env.NODE_ENV = "production";
            process.env.BUILD = "true";

            await init();

            log.banner();
            log.build("Rewriting Pages ...");

            await rewritePagesModule();
        });
}
