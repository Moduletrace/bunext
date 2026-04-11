import _ from "lodash";
import type {
    BunextPageModule,
    BunextPageModuleServerReturn,
    BunxRouteParams,
} from "../../../types";
import { log } from "../../../utils/log";
import writeCache from "../../cache/write-cache";

type Params = {
    html: string;
    module?: BunextPageModule;
    root_module?: BunextPageModule;
    routeParams?: BunxRouteParams;
    serverRes?: BunextPageModuleServerReturn<any, any>;
};

export default async function generateWebPageGetCachePage({
    module,
    routeParams,
    serverRes,
    root_module,
    html,
}: Params) {
    const config = _.merge(root_module?.config, module?.config);

    const cache_page = config?.cachePage || serverRes?.cache_page || false;
    const expiry_seconds = config?.cacheExpiry || serverRes?.cache_expiry;

    if (cache_page && routeParams?.url) {
        try {
            const is_cache =
                typeof cache_page == "boolean"
                    ? cache_page
                    : await cache_page({ ctx: routeParams, serverRes });

            if (!is_cache) {
                return false;
            }

            const key =
                routeParams.url.pathname + (routeParams.url.search || "");

            writeCache({
                key,
                value: html,
                paradigm: "html",
                expiry_seconds,
            });
        } catch (error: any) {
            log.error(`Error writing Cache => ${error.message}\n`, error);
        }
    }

    return true;
}
