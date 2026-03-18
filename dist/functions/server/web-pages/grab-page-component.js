import { jsx as _jsx } from "react/jsx-runtime";
import grabDirNames from "../../../utils/grab-dir-names";
import grabRouteParams from "../../../utils/grab-route-params";
import path from "path";
import AppNames from "../../../utils/grab-app-names";
import { existsSync } from "fs";
import grabPageErrorComponent from "./grab-page-error-component";
class NotFoundError extends Error {
}
export default async function grabPageComponent({ req, file_path: passed_file_path, }) {
    const url = req?.url ? new URL(req.url) : undefined;
    const router = global.ROUTER;
    const { PAGES_DIR } = grabDirNames();
    let routeParams = undefined;
    try {
        routeParams = req ? await grabRouteParams({ req }) : undefined;
        let url_path = url ? url.pathname : undefined;
        if (url_path && url?.search) {
            url_path += url.search;
        }
        const match = url_path ? router.match(url_path) : undefined;
        if (!match?.filePath && url?.pathname) {
            throw new NotFoundError(`Page ${url.pathname} not found`);
        }
        const file_path = match?.filePath || passed_file_path;
        if (!file_path) {
            const errMsg = `No File Path (\`file_path\`) or Request Object (\`req\`) provided not found`;
            // console.error(errMsg);
            throw new Error(errMsg);
        }
        const bundledMap = global.BUNDLER_CTX_MAP?.find((m) => m.local_path == file_path);
        if (!bundledMap?.path) {
            const errMsg = `No Bundled File Path for this request path!`;
            console.error(errMsg);
            throw new Error(errMsg);
        }
        // const pageName = grabPageName({ path: file_path });
        const root_pages_component_ts_file = `${path.join(PAGES_DIR, AppNames["RootPagesComponentName"])}.ts`;
        const root_pages_component_tsx_file = `${path.join(PAGES_DIR, AppNames["RootPagesComponentName"])}.tsx`;
        const root_pages_component_js_file = `${path.join(PAGES_DIR, AppNames["RootPagesComponentName"])}.js`;
        const root_pages_component_jsx_file = `${path.join(PAGES_DIR, AppNames["RootPagesComponentName"])}.jsx`;
        const root_file = existsSync(root_pages_component_tsx_file)
            ? root_pages_component_tsx_file
            : existsSync(root_pages_component_ts_file)
                ? root_pages_component_ts_file
                : existsSync(root_pages_component_jsx_file)
                    ? root_pages_component_jsx_file
                    : existsSync(root_pages_component_js_file)
                        ? root_pages_component_js_file
                        : undefined;
        const now = Date.now();
        const root_module = root_file
            ? await import(`${root_file}?t=${now}`)
            : undefined;
        const RootComponent = root_module?.default;
        // const component_file_path = root_module
        //     ? `${file_path}`
        //     : `${file_path}?t=${global.LAST_BUILD_TIME ?? 0}`;
        const module = await import(`${file_path}?t=${now}`);
        const serverRes = await (async () => {
            try {
                if (routeParams) {
                    const serverData = await module["server"]?.(routeParams);
                    return {
                        ...serverData,
                        query: match?.query,
                    };
                }
                return {
                    query: match?.query,
                };
            }
            catch (error) {
                return {
                    query: match?.query,
                };
            }
        })();
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
        const Component = module.default;
        const Head = module.Head;
        const component = RootComponent ? (_jsx(RootComponent, { ...serverRes, children: _jsx(Component, { ...serverRes }) })) : (_jsx(Component, { ...serverRes }));
        return {
            component,
            serverRes,
            routeParams,
            module,
            bundledMap,
            meta,
            head: Head,
        };
    }
    catch (error) {
        return await grabPageErrorComponent({
            error,
            routeParams,
            is404: error instanceof NotFoundError,
        });
    }
}
