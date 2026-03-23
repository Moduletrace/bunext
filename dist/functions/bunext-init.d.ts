import { type Ora } from "ora";
import type { BundlerCTXMap, BunextConfig, GlobalHMRControllerObject, PageFiles } from "../types";
import type { FileSystemRouter, Server } from "bun";
import { type FSWatcher } from "fs";
/**
 * # Declare Global Variables
 */
declare global {
    var ORA_SPINNER: Ora;
    var CONFIG: BunextConfig;
    var SERVER: Server<any> | undefined;
    var RECOMPILING: boolean;
    var WATCHER_TIMEOUT: any;
    var ROUTER: FileSystemRouter;
    var HMR_CONTROLLERS: GlobalHMRControllerObject[];
    var LAST_BUILD_TIME: number;
    var BUNDLER_CTX_MAP: {
        [k: string]: BundlerCTXMap;
    } | undefined;
    var BUNDLER_REBUILDS: 0;
    var PAGES_SRC_WATCHER: FSWatcher | undefined;
    var CURRENT_VERSION: string | undefined;
    var PAGE_FILES: PageFiles[];
    var ROOT_FILE_UPDATED: boolean;
}
export default function bunextInit(): Promise<void>;
