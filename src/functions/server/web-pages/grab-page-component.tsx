import type { FC } from "react";
import grabRouteParams from "../../../utils/grab-route-params";
import type {
    BunextPageModule,
    BunextPageModuleServerReturn,
    BunxRouteParams,
    GrabPageComponentRes,
} from "../../../types";
import grabPageErrorComponent from "./grab-page-error-component";
import grabPageBundledReactComponent from "./grab-page-bundled-react-component";
import _ from "lodash";
import { log } from "../../../utils/log";
import grabRootFile from "./grab-root-file";

class NotFoundError extends Error {}

type Params = {
    req?: Request;
    file_path?: string;
    debug?: boolean;
};

export default async function grabPageComponent({
    req,
    file_path: passed_file_path,
    debug,
}: Params): Promise<GrabPageComponentRes> {
    const url = req?.url ? new URL(req.url) : undefined;
    const router = global.ROUTER;
    const now = Date.now();

    let routeParams: BunxRouteParams | undefined = undefined;

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
            // console.error(errMsg);
            throw new Error(errMsg);
        }

        const bundledMap = global.BUNDLER_CTX_MAP?.find(
            (m) => m.local_path == file_path,
        );

        if (!bundledMap?.path) {
            const errMsg = `No Bundled File Path for this request path!`;
            console.error(errMsg);
            throw new Error(errMsg);
        }

        if (debug) {
            log.info(`bundledMap:`, bundledMap);
        }

        const { root_file } = grabRootFile();

        const module: BunextPageModule = await import(`${file_path}?t=${now}`);

        if (debug) {
            log.info(`module:`, module);
        }

        const serverRes: BunextPageModuleServerReturn = await (async () => {
            const default_props: BunextPageModuleServerReturn = {
                url: {
                    ...(_.pick<URL, keyof URL>(url!, [
                        "host",
                        "hostname",
                        "pathname",
                        "origin",
                        "port",
                        "search",
                        "searchParams",
                        "hash",
                        "href",
                        "password",
                        "protocol",
                        "username",
                    ]) as any),
                },
                query: match?.query,
            };

            try {
                if (routeParams) {
                    const serverData = await module["server"]?.({
                        ...routeParams,
                        query: { ...routeParams.query, ...match?.query },
                    });
                    return {
                        ...serverData,
                        ...default_props,
                    };
                }
                return {
                    ...default_props,
                };
            } catch (error) {
                return {
                    ...default_props,
                };
            }
        })();

        if (debug) {
            log.info(`serverRes:`, serverRes);
        }

        const meta = module.meta
            ? typeof module.meta == "function" && routeParams
                ? await module.meta({
                      ctx: routeParams,
                      serverRes,
                  })
                : typeof module.meta == "object"
                  ? module.meta
                  : undefined
            : undefined;

        if (debug) {
            log.info(`meta:`, meta);
        }

        const Head = module.Head as FC<any>;

        const { component } =
            (await grabPageBundledReactComponent({
                file_path,
                root_file,
                server_res: serverRes,
            })) || {};

        if (!component) {
            throw new Error(`Couldn't grab page component`);
        }

        if (debug) {
            log.info(`component:`, component);
        }

        return {
            component,
            serverRes,
            routeParams,
            module,
            bundledMap,
            meta,
            head: Head,
        };
    } catch (error: any) {
        console.error(`Error Grabbing Page Component: ${error.message}`);

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
