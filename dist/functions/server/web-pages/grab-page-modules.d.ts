import type { BunextPageModule, BunxRouteParams } from "../../../types";
type Params = {
    file_path: string;
    debug?: boolean;
    url?: URL;
    query?: any;
    routeParams?: BunxRouteParams;
    skip_server_res?: boolean;
};
export default function grabPageModules({ file_path, debug, url, query, routeParams, skip_server_res, }: Params): Promise<{
    component: import("react").FC;
    serverRes: import("../../../types").BunextPageModuleServerReturn | undefined;
    module: BunextPageModule;
    root_module: BunextPageModule | undefined;
}>;
export {};
