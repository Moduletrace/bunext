import grabRouteParams from "../../../utils/grab-route-params";
import grabPageErrorComponent from "./grab-page-error-component";
import _ from "lodash";
import { log } from "../../../utils/log";
import grabPageModules from "./grab-page-modules";
import grabPageCombinedServerRes from "./grab-page-combined-server-res";
class NotFoundError extends Error {
}
export default async function grabPageComponent({ req, file_path: passed_file_path, debug, return_server_res_only, }) {
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
        });
        return {
            component,
            serverRes,
            routeParams,
            module,
            bundledMap,
            root_module,
        };
    }
    catch (error) {
        log.error(`Error Grabbing Page Component: ${error.message}`);
        return await grabPageErrorComponent({
            error,
            routeParams,
            is404: error instanceof NotFoundError,
            url,
        });
    }
}
// let root_module: any;
// if (root_file) {
//     if (isDevelopment()) {
//         root_module = await grabFilePathModule({
//             file_path: root_file,
//         });
//     } else {
//         root_module = root_file ? await import(root_file) : undefined;
//     }
// }
// const RootComponent = root_module?.default as FC<any> | undefined;
// let module: BunextPageModule;
// if (isDevelopment()) {
//     module = await grabFilePathModule({ file_path });
// } else {
//     module = await import(file_path);
// }
// const Component = main_module.default as FC<any>;
// const component = RootComponent ? (
//     <RootComponent {...serverRes}>
//         <Component {...serverRes} />
//     </RootComponent>
// ) : (
//     <Component {...serverRes} />
// );
