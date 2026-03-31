#!/usr/bin/env bun
import { program } from "commander";
import start from "./start";
import dev from "./dev";
import build from "./build";
import { log } from "../utils/log";
import rewritePages from "./rewrite-pages";
/**
 * # Describe Program
 */
program
    .name(`bunext`)
    .description(`A React Next JS replacement built with bun JS`)
    .version(`1.0.43`);
/**
 * # Declare Commands
 */
program.addCommand(dev());
program.addCommand(start());
program.addCommand(build());
program.addCommand(rewritePages());
/**
 * # Handle Unavailable Commands
 */
program.on("command:*", () => {
    log.error("Invalid command: %s\nSee --help for a list of available commands." +
        " " +
        program.args.join(" "));
    process.exit(1);
});
/**
 * # Parse Arguments
 */
program.parse(Bun.argv);
