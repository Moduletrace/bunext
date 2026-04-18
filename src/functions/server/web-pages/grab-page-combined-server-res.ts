import type {
    BunextPageModuleServerReturn,
    BunextPageServerModule,
    BunxRouteParams,
} from "../../../types";
import _ from "lodash";
import { log } from "../../../utils/log";
import grabRootFilePath from "./grab-root-file-path";
import grabPageServerRes from "./grab-page-server-res";
import grabPageServerPath from "./grab-page-server-path";

type Params = {
    file_path: string;
    debug?: boolean;
    url?: URL;
    query?: any;
    routeParams?: BunxRouteParams;
};

export default async function grabPageCombinedServerRes({
    file_path,
    debug,
    url,
    query,
    routeParams,
}: Params) {
    const now = Date.now();

    const { root_file_path } = grabRootFilePath();
    const { server_file_path: root_server_file_path } = root_file_path
        ? grabPageServerPath({ file_path: root_file_path })
        : {};
    const root_server_module: BunextPageServerModule = root_server_file_path
        ? await import(`${root_server_file_path}?t=${now}`)
        : undefined;

    const root_server_fn =
        root_server_module?.default || root_server_module?.server;

    const rootServerRes: BunextPageModuleServerReturn | undefined =
        await grabPageServerRes({
            server_function: root_server_fn,
            url,
            query,
            routeParams,
        });

    if (debug) {
        log.info(`rootServerRes:`, rootServerRes);
    }

    const { server_file_path } = grabPageServerPath({ file_path });
    const server_module: BunextPageServerModule = server_file_path
        ? await import(`${server_file_path}?t=${now}`)
        : undefined;

    const server_fn = server_module?.default || server_module?.server;

    const serverRes: BunextPageModuleServerReturn | undefined =
        await grabPageServerRes({
            server_function: server_fn,
            url,
            query,
            routeParams,
            props: rootServerRes?.props || null,
        });

    const mergedServerRes = _.merge(rootServerRes || {}, serverRes || {});

    return { serverRes: mergedServerRes };
}
