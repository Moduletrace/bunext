import type {
    BunextPageModule,
    BunextPageModuleServerReturn,
    BunextPageServerModule,
    BunextRootModule,
    BunxRouteParams,
} from "../../../types";
import grabPageBundledReactComponent from "./grab-page-bundled-react-component";
import _ from "lodash";
import { log } from "../../../utils/log";
import grabRootFilePath from "./grab-root-file-path";
import grabPageServerRes from "./grab-page-server-res";
import grabPageServerPath from "./grab-page-server-path";
import type { JSX } from "react";

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
    const { server_file_path: root_server_file_path } = root_file_path
        ? grabPageServerPath({ file_path: root_file_path })
        : {};
    const root_server_module: BunextPageServerModule = root_server_file_path
        ? await import(`${root_server_file_path}?t=${now}`)
        : undefined;

    const root_server_fn =
        root_server_module?.default || root_server_module?.server;

    const rootServerRes: BunextPageModuleServerReturn | undefined =
        root_server_fn
            ? await grabPageServerRes({
                  server_function: root_server_fn,
                  url,
                  query,
                  routeParams,
              })
            : undefined;

    if (debug) {
        log.info(`rootServerRes:`, rootServerRes);
    }

    const module: BunextPageModule = await import(`${file_path}?t=${now}`);
    const { server_file_path } = grabPageServerPath({ file_path });
    const server_module: BunextPageServerModule = server_file_path
        ? await import(`${server_file_path}?t=${now}`)
        : undefined;

    if (debug) {
        log.info(`module:`, module);
    }

    const server_fn = server_module?.default || server_module?.server;

    const serverRes: BunextPageModuleServerReturn | undefined = server_fn
        ? await grabPageServerRes({
              server_function: server_fn,
              url,
              query,
              routeParams,
          })
        : undefined;

    if (debug) {
        log.info(`serverRes:`, serverRes);
    }

    const mergedServerRes = _.merge(rootServerRes || {}, serverRes || {});

    const { component } =
        (await grabPageBundledReactComponent({
            file_path,
            root_file_path,
            server_res: mergedServerRes,
        })) || {};

    if (!component) {
        throw new Error(`Couldn't grab page component`);
    }

    if (debug) {
        log.info(`component:`, component);
    }

    return {
        component,
        serverRes: mergedServerRes,
        module,
        root_module,
    };
}
