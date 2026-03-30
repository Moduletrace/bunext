import type { BunextPageModuleServerReturn, BunxRouteParams } from "../../../types";
type Params = {
    file_path: string;
    debug?: boolean;
    url?: URL;
    query?: any;
    routeParams?: BunxRouteParams;
};
export default function grabPageCombinedServerRes({ file_path, debug, url, query, routeParams, }: Params): Promise<{
    serverRes: BunextPageModuleServerReturn;
}>;
export {};
