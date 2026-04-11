import grabRouteParams from "../../../utils/grab-route-params";
import grabPageErrorComponent from "./grab-page-error-component";
import _ from "lodash";
import { log } from "../../../utils/log";
import grabPageModules from "./grab-page-modules";
import grabPageCombinedServerRes from "./grab-page-combined-server-res";
import fullRebuild from "../full-rebuild";
class NotFoundError extends Error {
    status = 404;
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
    }
}
export default async function grabPageComponent(params) {
    const { req, file_path: passed_file_path, debug, return_server_res_only, skip_server_res, } = params;
    const url = req?.url ? new URL(req.url) : undefined;
    const router = global.ROUTER;
    let routeParams = undefined;
    try {
        routeParams = req ? await grabRouteParams({ req }) : undefined;
        let url_path = url ? url.pathname : undefined;
        if (url_path && url?.search) {
            url_path += url.search;
        }
        if (debug) {
            log.info(`url_path:`, url_path);
        }
        const match = url_path ? router.match(url_path) : undefined;
        if (!match?.filePath && url?.pathname) {
            throw new NotFoundError(`Page ${url.pathname} not found`);
        }
        const file_path = match?.filePath || passed_file_path;
        if (debug) {
            log.info(`file_path:`, file_path);
        }
        if (!file_path) {
            const errMsg = `No File Path (\`file_path\`) or Request Object (\`req\`) provided not found`;
            // log.error(errMsg);
            throw new Error(errMsg);
        }
        const bundledMap = global.BUNDLER_CTX_MAP?.[file_path];
        if (!bundledMap?.path) {
            console.log(global.BUNDLER_CTX_MAP);
            const errMsg = `No Bundled File Path for this request path!`;
            log.error(errMsg);
            throw new Error(errMsg);
        }
        if (debug) {
            log.info(`bundledMap:`, bundledMap);
        }
        if (return_server_res_only) {
            const { serverRes } = await grabPageCombinedServerRes({
                file_path,
                debug,
                query: match?.query,
                routeParams,
                url,
            });
            return { serverRes };
        }
        const { component, module, serverRes, root_module } = await grabPageModules({
            file_path,
            debug,
            query: match?.query,
            routeParams,
            url,
            skip_server_res,
        });
        global.IS_404_PAGE = false;
        return {
            component,
            serverRes,
            routeParams,
            module,
            bundledMap,
            root_module,
            success: true,
        };
    }
    catch (error) {
        const is404 = error instanceof NotFoundError ||
            error?.name === "NotFoundError" ||
            error?.status === 404;
        if (!params.retry) {
            while (global.REBUILD_RETRIES < 2) {
                global.REBUILD_RETRIES = global.REBUILD_RETRIES + 1;
                await fullRebuild();
                await Bun.sleep(200);
                const component_retried = await grabPageComponent({
                    ...params,
                    retry: true,
                });
                if (component_retried.success) {
                    global.REBUILD_RETRIES = 0;
                    return component_retried;
                }
            }
            global.REBUILD_RETRIES = 0;
        }
        if (is404) {
            global.IS_404_PAGE = true;
        }
        else {
            log.error(`Error Grabbing Page Component: ${error.message}`);
            log.error(`Page: ${passed_file_path || url?.pathname}`);
        }
        return await grabPageErrorComponent({
            error,
            routeParams,
            is404,
            url,
        });
    }
}
