import type { BunextPageModuleServerReturn, BunextPageServerFn, BunxRouteParams } from "../../../types";
type Params = {
    url?: URL;
    server_function?: BunextPageServerFn;
    query?: Record<string, string>;
    routeParams?: BunxRouteParams;
    props?: Record<string, any> | null;
};
export default function grabPageServerRes({ url, query, routeParams, server_function, props, }: Params): Promise<BunextPageModuleServerReturn>;
export {};
