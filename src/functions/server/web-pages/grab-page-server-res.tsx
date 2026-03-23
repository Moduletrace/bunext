import type {
    BunextPageModule,
    BunextPageModuleServerReturn,
    BunxRouteParams,
    GrabPageComponentRes,
} from "../../../types";
import _ from "lodash";

type Params = {
    url?: URL;
    module: BunextPageModule;
    query?: Record<string, string>;
    routeParams?: BunxRouteParams;
};

export default async function grabPageServerRes({
    url,
    query,
    routeParams,
    module,
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
            const serverData = await module["server"]?.({
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
