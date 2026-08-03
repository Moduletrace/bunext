import type { BundlerCTXMap, BunextConfig, GlobalHMRControllerObject, PageFiles } from "../types";
import type { FileSystemRouter, Server } from "bun";
import { type DirNames } from "../utils/grab-dir-names";
import type { BuildContext } from "esbuild";
import grabConstants from "../utils/grab-constants";
import type { FSWatcher } from "fs";
/**
 * # Declare Global Variables
 */
declare global {
    var BUNEXT_CONFIG: BunextConfig;
    var BUNEXT_SERVER: Server<any> | undefined;
    var BUNEXT_RECOMPILING: boolean;
    var BUNEXT_BUILDING_SSR: boolean;
    var BUNEXT_IS_SERVER_COMPONENT: boolean;
    var BUNEXT_WATCHER_TIMEOUT: any;
    var BUNEXT_ROUTER: FileSystemRouter;
    var BUNEXT_HMR_CONTROLLERS: GlobalHMRControllerObject[];
    var BUNEXT_LAST_BUILD_TIME: number;
    var BUNEXT_BUNDLER_CTX_MAP: {
        [k: string]: BundlerCTXMap;
    };
    var BUNEXT_SSR_BUNDLER_CTX_MAP: {
        [k: string]: BundlerCTXMap;
    };
    var BUNEXT_BUNDLER_REBUILDS: 0;
    var BUNEXT_PAGES_SRC_WATCHER: FSWatcher | undefined;
    var BUNEXT_CURRENT_VERSION: string | undefined;
    var BUNEXT_PAGE_FILES: PageFiles[];
    var BUNEXT_ROOT_FILE_UPDATED: boolean;
    var BUNEXT_SKIPPED_BROWSER_MODULES: Set<string>;
    var BUNEXT_BUNDLER_CTX: BuildContext | undefined;
    var BUNEXT_SSR_BUNDLER_CTX: BuildContext | undefined;
    var BUNEXT_DIR_NAMES: DirNames;
    var BUNEXT_REACT_IMPORTS_MAP: {
        imports: Record<string, string>;
    };
    var BUNEXT_REACT_DOM_SERVER: any;
    var BUNEXT_REACT_DOM_MODULE_CACHE: Map<string, {
        main: any;
        css: string;
    }>;
    var BUNEXT_BUNDLER_CTX_DISPOSED: boolean | undefined;
    var BUNEXT_SSR_BUNDLER_CTX_DISPOSED: boolean | undefined;
    var BUNEXT_REBUILD_RETRIES: number;
    var BUNEXT_IS_404_PAGE: boolean;
    var BUNEXT_CONSTANTS: ReturnType<typeof grabConstants>;
    var BUNEXT_MAIN_CTX_BUILD_STARTS: number;
}
type Params = {
    build_only?: boolean;
};
export default function bunextInit(params?: Params): Promise<void>;
export {};
