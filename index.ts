#!/usr/bin/env bun

import { program } from "commander";
import start from "./commands/start";
import dev from "./commands/dev";
import ora, { type Ora } from "ora";
import type { BunextConfig } from "./src/types";
import type { FileSystemRouter, Server } from "bun";
import init from "./src/functions/init";
import grabDirNames from "./src/utils/grab-dir-names";
import build from "./commands/build";

/**
 * # Declare Global Variables
 */
declare global {
    var ORA_SPINNER: Ora;
    var CONFIG: BunextConfig;
    var SERVER: Server | undefined;
    var RECOMPILING: boolean;
    var WATCHER_TIMEOUT: any;
    var ROUTER: FileSystemRouter;
    var HMR_CONTROLLERS: Set<ReadableStreamDefaultController<string>>;
    var LAST_BUILD_TIME: number;
}

global.ORA_SPINNER = ora();
global.ORA_SPINNER.clear();
global.HMR_CONTROLLERS = new Set();

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
    console.error(
        "Invalid command: %s\nSee --help for a list of available commands.",
        program.args.join(" "),
    );
    process.exit(1);
});

/**
 * # Parse Arguments
 */
program.parse(Bun.argv);
