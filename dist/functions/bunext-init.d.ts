import type { BundlerCTXMap, BunextConfig, GlobalHMRControllerObject, PageFiles } from "../types";
import type { FileSystemRouter, Server } from "bun";
import grabDirNames from "../utils/grab-dir-names";
import { type FSWatcher } from "fs";
import type { BuildContext } from "esbuild";
import grabConstants from "../utils/grab-constants";
/**
 * # Declare Global Variables
 */
declare global {
    var CONFIG: BunextConfig;
    var SERVER: Server<any> | undefined;
    var RECOMPILING: boolean;
    var BUILDING_SSR: boolean;
    var IS_SERVER_COMPONENT: boolean;
    var WATCHER_TIMEOUT: any;
    var ROUTER: FileSystemRouter;
    var HMR_CONTROLLERS: GlobalHMRControllerObject[];
    var LAST_BUILD_TIME: number;
    var BUNDLER_CTX_MAP: {
        [k: string]: BundlerCTXMap;
    };
    var SSR_BUNDLER_CTX_MAP: {
        [k: string]: BundlerCTXMap;
    };
    var BUNDLER_REBUILDS: 0;
    var PAGES_SRC_WATCHER: FSWatcher | undefined;
    var CURRENT_VERSION: string | undefined;
    var PAGE_FILES: PageFiles[];
    var ROOT_FILE_UPDATED: boolean;
    var SKIPPED_BROWSER_MODULES: Set<string>;
    var BUNDLER_CTX: BuildContext | undefined;
    var SSR_BUNDLER_CTX: BuildContext | undefined;
    var DIR_NAMES: ReturnType<typeof grabDirNames>;
    var REACT_IMPORTS_MAP: {
        imports: Record<string, string>;
    };
    var REACT_DOM_SERVER: any;
    var REACT_DOM_MODULE_CACHE: Map<string, {
        main: any;
        css: string;
    }>;
    var BUNDLER_CTX_DISPOSED: boolean | undefined;
    var REBUILD_RETRIES: number;
    var IS_404_PAGE: boolean;
    var CONSTANTS: ReturnType<typeof grabConstants>;
}
export default function bunextInit(): Promise<void>;
