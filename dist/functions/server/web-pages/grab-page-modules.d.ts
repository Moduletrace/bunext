import type { BunextPageModule, BunxRouteParams } from "../../../types";
type Params = {
    file_path: string;
    debug?: boolean;
    url?: URL;
    query?: any;
    routeParams?: BunxRouteParams;
};
export default function grabPageModules({ file_path, debug, url, query, routeParams, }: Params): Promise<{
    component: import("react").JSX.Element;
    serverRes: import("../../../types").BunextPageModuleServerReturn;
    module: BunextPageModule;
    root_module: BunextPageModule | undefined;
}>;
export {};
