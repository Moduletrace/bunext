import type { BunextPageModule, BunextPageModuleServerReturn, BunxRouteParams } from "../../../types";
type Params = {
    html: string;
    module: BunextPageModule;
    root_module?: BunextPageModule;
    routeParams?: BunxRouteParams;
    serverRes?: BunextPageModuleServerReturn<any, any>;
};
export default function generateWebPageGetCachePage({ module, routeParams, serverRes, root_module, html, }: Params): Promise<boolean>;
export {};
