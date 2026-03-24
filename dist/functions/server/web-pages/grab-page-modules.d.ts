import type { BunextPageModule, BunextPageModuleServerReturn, BunxRouteParams } from "../../../types";
import type { JSX } from "react";
type Params = {
    file_path: string;
    debug?: boolean;
    url?: URL;
    query?: any;
    routeParams?: BunxRouteParams;
};
export default function grabPageModules({ file_path, debug, url, query, routeParams, }: Params): Promise<{
    component: JSX.Element;
    serverRes: BunextPageModuleServerReturn;
    module: BunextPageModule;
    root_module: BunextPageModule | undefined;
}>;
export {};
