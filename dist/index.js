#!/usr/bin/env bun
import { program } from "commander";
import start from "./commands/start";
import dev from "./commands/dev";
import ora, {} from "ora";
import init from "./functions/init";
import grabDirNames from "./utils/grab-dir-names";
import build from "./commands/build";
global.ORA_SPINNER = ora();
global.ORA_SPINNER.clear();
global.HMR_CONTROLLERS = [];
global.IS_FIRST_BUNDLE_READY = false;
global.BUNDLER_REBUILDS = 0;
global.PAGE_FILES = [];
await init();
const { PAGES_DIR } = grabDirNames();
const router = new Bun.FileSystemRouter({
    style: "nextjs",
    dir: PAGES_DIR,
});
global.ROUTER = router;
/**
 * # Describe Program
 */
program
    .name(`bunext`)
    .description(`A React Next JS replacement built with bun JS`)
    .version(`1.0.0`);
/**
 * # Declare Commands
 */
program.addCommand(dev());
program.addCommand(start());
program.addCommand(build());
/**
 * # Handle Unavailable Commands
 */
program.on("command:*", () => {
    console.error("Invalid command: %s\nSee --help for a list of available commands.", program.args.join(" "));
    process.exit(1);
});
/**
 * # Parse Arguments
 */
program.parse(Bun.argv);
