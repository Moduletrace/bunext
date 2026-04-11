import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import grabDirNames from "../../../utils/grab-dir-names";
import grabPageModules from "./grab-page-modules";
import _ from "lodash";
export default async function grabPageErrorComponent({ error, routeParams, is404, url, }) {
    const router = global.ROUTER;
    const { BUNX_ROOT_500_PRESET_COMPONENT, BUNX_ROOT_404_PRESET_COMPONENT } = grabDirNames();
    const errorRoute = is404 ? "/404" : "/500";
    const presetComponent = is404
        ? BUNX_ROOT_404_PRESET_COMPONENT
        : BUNX_ROOT_500_PRESET_COMPONENT;
    const default_server_res = {
        response_options: {
            status: is404 ? 404 : 500,
        },
    };
    try {
        const match = router.match(errorRoute);
        if (!match?.filePath) {
            const default_module = await import(presetComponent);
            const Component = default_module.default;
            const default_jsx = () => {
                return _jsx(Component, { children: _jsx("span", { children: error.message }) });
            };
            return {
                component: default_jsx,
                module: default_module,
                routeParams,
                serverRes: default_server_res,
            };
        }
        const file_path = match.filePath;
        const bundledMap = global.BUNDLER_CTX_MAP?.[file_path];
        const { component, module, serverRes, root_module } = await grabPageModules({
            file_path: file_path,
            query: match?.query,
            routeParams,
            url,
        });
        return {
            component,
            routeParams,
            module,
            bundledMap,
            serverRes: _.merge(serverRes, default_server_res),
            root_module,
        };
    }
    catch {
        const DefaultNotFound = () => (_jsxs("div", { style: {
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
            }, children: [_jsx("h1", { children: is404 ? "404 Not Found" : "500 Internal Server Error" }), _jsx("span", { children: error.message })] }));
        return {
            component: DefaultNotFound,
            routeParams,
            module: { default: DefaultNotFound },
            serverRes: default_server_res,
        };
    }
}
