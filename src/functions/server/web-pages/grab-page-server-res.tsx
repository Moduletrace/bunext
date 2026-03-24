import type {
    BunextPageModule,
    BunextPageModuleServerReturn,
    BunextPageServerFn,
    BunxRouteParams,
    GrabPageComponentRes,
} from "../../../types";
import _ from "lodash";

type Params = {
    url?: URL;
    server_function: BunextPageServerFn;
    query?: Record<string, string>;
    routeParams?: BunxRouteParams;
};

export default async function grabPageServerRes({
    url,
    query,
    routeParams,
    server_function,
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

    try {
        if (routeParams) {
            const serverData = await server_function({
                ...routeParams,
                query: { ...routeParams.query, ...query },
            });
            return {
                ...serverData,
                ...default_props,
            };
        }
        return {
            ...default_props,
        };
    } catch (error) {
        return {
            ...default_props,
        };
    }
}
