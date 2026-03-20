#!/usr/bin/env bun

import { program } from "commander";
import start from "./start";
import dev from "./dev";
import ora, { type Ora } from "ora";
import type {
    BundlerCTXMap,
    BunextConfig,
    GlobalHMRControllerObject,
    PageFiles,
} from "../types";
import type { FileSystemRouter, Server } from "bun";
import init from "../functions/init";
import grabDirNames from "../utils/grab-dir-names";
import build from "./build";
import type { BuildContext } from "esbuild";
import type { FSWatcher } from "fs";

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
    var HMR_CONTROLLERS: GlobalHMRControllerObject[];
    var LAST_BUILD_TIME: number;
    var BUNDLER_CTX: BuildContext | undefined;
    var BUNDLER_CTX_MAP: BundlerCTXMap[] | undefined;
    var IS_FIRST_BUNDLE_READY: boolean;
    var BUNDLER_REBUILDS: 0;
    var PAGES_SRC_WATCHER: FSWatcher | undefined;
    var CURRENT_VERSION: string | undefined;
    var PAGE_FILES: PageFiles[];
}

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
