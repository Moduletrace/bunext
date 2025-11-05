#!/usr/bin/env node

import { program } from "commander";
import start from "./commands/start";
import dev from "./commands/dev";
import build from "./commands/build";
import init from "./commands/init";
import ora, { type Ora } from "ora";
import type { BunextConfig } from "./types";
import type { Server } from "bun";

/**
 * # Declare Global Variables
 */
declare global {
    var ORA_SPINNER: Ora;
    var CONFIG: BunextConfig;
    var SERVER: Server | undefined;
}

global.ORA_SPINNER = ora();
global.ORA_SPINNER.clear();

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
program.addCommand(start());
program.addCommand(dev());
program.addCommand(build());
program.addCommand(init());

/**
 * # Handle Unavailable Commands
 */
program.on("command:*", () => {
    console.error(
        "Invalid command: %s\nSee --help for a list of available commands.",
        program.args.join(" ")
    );
    process.exit(1);
});

/**
 * # Parse Arguments
 */
program.parse(Bun.argv);
