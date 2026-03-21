import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import grabDirNames from "../../../utils/grab-dir-names";
export default async function grabPageErrorComponent({ error, routeParams, is404, }) {
    const router = global.ROUTER;
    const { BUNX_ROOT_500_PRESET_COMPONENT, BUNX_ROOT_404_PRESET_COMPONENT } = grabDirNames();
    const errorRoute = is404 ? "/404" : "/500";
    const presetComponent = is404
        ? BUNX_ROOT_404_PRESET_COMPONENT
        : BUNX_ROOT_500_PRESET_COMPONENT;
    try {
        const match = router.match(errorRoute);
        const filePath = match?.filePath || presetComponent;
        const bundledMap = match?.filePath
            ? (global.BUNDLER_CTX_MAP?.find((m) => m.local_path === match.filePath) ?? {})
            : {};
        const module = await import(filePath);
        const Component = module.default;
        const component = _jsx(Component, { children: _jsx("span", { children: error.message }) });
        return {
            component,
            routeParams,
            module,
            bundledMap,
            serverRes: {
                responseOptions: {
                    status: is404 ? 404 : 500
                }
            }
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
            component: _jsx(DefaultNotFound, {}),
            routeParams,
            module: { default: DefaultNotFound },
            bundledMap: {},
            serverRes: {
                responseOptions: {
                    status: is404 ? 404 : 500
                }
            }
        };
    }
}
