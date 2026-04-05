import type {
    BunextPageModule,
    BunextRootModule,
    BunxRouteParams,
} from "../../../types";
import grabPageBundledReactComponent from "./grab-page-bundled-react-component";
import _ from "lodash";
import { log } from "../../../utils/log";
import grabRootFilePath from "./grab-root-file-path";
import grabPageCombinedServerRes from "./grab-page-combined-server-res";

type Params = {
    file_path: string;
    debug?: boolean;
    url?: URL;
    query?: any;
    routeParams?: BunxRouteParams;
};

export default async function grabPageModules({
    file_path,
    debug,
    url,
    query,
    routeParams,
}: Params) {
    const now = Date.now();

    const { root_file_path } = grabRootFilePath();
    const root_module: BunextRootModule | undefined = root_file_path
        ? await import(`${root_file_path}?t=${now}`)
        : undefined;

    const module: BunextPageModule = await import(`${file_path}?t=${now}`);

    if (debug) {
        log.info(`module:`, module);
    }

    const { serverRes } = await grabPageCombinedServerRes({
        file_path,
        debug,
        query,
        routeParams,
        url,
    });

    const { component } =
        (await grabPageBundledReactComponent({
            file_path,
            root_file_path,
            server_res: serverRes,
        })) || {};

    if (!component) {
        throw new Error(`Couldn't grab page component`);
    }

    if (debug) {
        log.info(`component:`, component);
    }

    return {
        component,
        serverRes,
        module,
        root_module,
    };
}
