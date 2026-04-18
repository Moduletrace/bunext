import type {
    BunextPageModule,
    BunextPageModuleServerReturn,
    BunextPageServerFn,
    BunxRouteParams,
    GrabPageComponentRes,
} from "../../../types";
import _ from "lodash";
import { log } from "../../../utils/log";

type Params = {
    url?: URL;
    server_function?: BunextPageServerFn;
    query?: Record<string, string>;
    routeParams?: BunxRouteParams;
    props?: Record<string, any> | null;
};

export default async function grabPageServerRes({
    url,
    query,
    routeParams,
    server_function,
    props,
}: Params): Promise<BunextPageModuleServerReturn> {
    const default_props: BunextPageModuleServerReturn = {
        url: url
            ? {
                  ...(_.pick<URL, keyof URL>(url, [
                      "host",
                      "hostname",
                      "pathname",
                      "origin",
                      "port",
                      "search",
                      "searchParams",
                      "hash",
                      "href",
                      "password",
                      "protocol",
                      "username",
                  ]) as any),
              }
            : null,
        query,
    };

    const init_props = props || null;

    try {
        if (routeParams && server_function) {
            const serverData = await server_function({
                ...routeParams,
                query: { ...routeParams.query, ...query },
                props: init_props,
            });

            return _.merge(default_props, serverData);
        }

        return _.merge(default_props);
    } catch (error: any) {
        log.error(
            `Page ${url?.pathname} Server Error => ${error.message}\n`,
            error,
        );

        return _.merge(default_props, {
            error: error.message,
        });
    }
}
