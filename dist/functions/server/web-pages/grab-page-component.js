import grabRouteParams from "../../../utils/grab-route-params";
import grabPageErrorComponent from "./grab-page-error-component";
import grabPageBundledReactComponent from "./grab-page-bundled-react-component";
import _ from "lodash";
import { log } from "../../../utils/log";
import grabRootFilePath from "./grab-root-file-path";
import grabPageServerRes from "./grab-page-server-res";
import grabPageServerPath from "./grab-page-server-path";
class NotFoundError extends Error {
}
export default async function grabPageComponent({ req, file_path: passed_file_path, debug, }) {
    const url = req?.url ? new URL(req.url) : undefined;
    const router = global.ROUTER;
    const now = Date.now();
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
        const { root_file_path } = grabRootFilePath();
        const root_module = root_file_path
            ? await import(`${root_file_path}?t=${now}`)
            : undefined;
        const { server_file_path: root_server_file_path } = root_file_path
            ? grabPageServerPath({ file_path: root_file_path })
            : {};
        const root_server_module = root_server_file_path
            ? await import(`${root_server_file_path}?t=${now}`)
            : undefined;
        const root_server_fn = root_server_module?.default || root_server_module?.server;
        const rootServerRes = root_server_fn
            ? await grabPageServerRes({
                server_function: root_server_fn,
                url,
                query: match?.query,
                routeParams,
            })
            : undefined;
        if (debug) {
            log.info(`rootServerRes:`, rootServerRes);
        }
        const module = await import(`${file_path}?t=${now}`);
        const { server_file_path } = grabPageServerPath({ file_path });
        const server_module = server_file_path
            ? await import(`${server_file_path}?t=${now}`)
            : undefined;
        if (debug) {
            log.info(`module:`, module);
        }
        const server_fn = server_module?.default || server_module?.server;
        const serverRes = server_fn
            ? await grabPageServerRes({
                server_function: server_fn,
                url,
                query: match?.query,
                routeParams,
            })
            : undefined;
        if (debug) {
            log.info(`serverRes:`, serverRes);
        }
        const mergedServerRes = _.merge(rootServerRes || {}, serverRes || {});
        const { component } = (await grabPageBundledReactComponent({
            file_path,
            root_file_path,
            server_res: mergedServerRes,
        })) || {};
        if (!component) {
            throw new Error(`Couldn't grab page component`);
        }
        if (debug) {
            log.info(`component:`, component);
        }
        return {
            component,
            serverRes: mergedServerRes,
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
