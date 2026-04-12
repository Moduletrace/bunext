import type { BunextPageModule, BunextPageModuleServerReturn, BunxRouteParams } from "../../../types";
import type { FC } from "react";
type Params = {
    file_path: string;
    debug?: boolean;
    url?: URL;
    query?: any;
    routeParams?: BunxRouteParams;
    skip_server_res?: boolean;
};
type Return = {
    component: FC;
    serverRes: BunextPageModuleServerReturn | undefined;
    module: BunextPageModule;
    root_module: BunextPageModule | undefined;
};
export default function grabPageModules({ file_path, debug, url, query, routeParams, skip_server_res, }: Params): Promise<Return | Response>;
export {};
