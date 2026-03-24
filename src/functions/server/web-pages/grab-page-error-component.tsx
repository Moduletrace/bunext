import type { FC } from "react";
import grabDirNames from "../../../utils/grab-dir-names";
import type {
    BunextPageModule,
    BunxRouteParams,
    GrabPageComponentRes,
} from "../../../types";
import grabPageModules from "./grab-page-modules";
import _ from "lodash";

type Params = {
    error?: any;
    routeParams?: BunxRouteParams;
    is404?: boolean;
    url?: URL;
};

export default async function grabPageErrorComponent({
    error,
    routeParams,
    is404,
    url,
}: Params): Promise<GrabPageComponentRes> {
    const router = global.ROUTER;

    const { BUNX_ROOT_500_PRESET_COMPONENT, BUNX_ROOT_404_PRESET_COMPONENT } =
        grabDirNames();

    const errorRoute = is404 ? "/404" : "/500";
    const presetComponent = is404
        ? BUNX_ROOT_404_PRESET_COMPONENT
        : BUNX_ROOT_500_PRESET_COMPONENT;

    const default_server_res = {
        responseOptions: {
            status: is404 ? 404 : 500,
        },
    };

    try {
        const match = router.match(errorRoute);

        if (!match?.filePath) {
            const default_module: BunextPageModule = await import(
                presetComponent
            );
            const Component = default_module.default as FC<any>;
            const default_jsx = (
                <Component>{<span>{error.message}</span>}</Component>
            );

            return {
                component: default_jsx,
                module: default_module,
                routeParams,
                serverRes: default_server_res,
            };
        }

        const file_path = match.filePath;

        const bundledMap = global.BUNDLER_CTX_MAP?.[file_path];

        const { component, module, serverRes, root_module } =
            await grabPageModules({
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
    } catch {
        const DefaultNotFound: FC = () => (
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                }}
            >
                <h1>{is404 ? "404 Not Found" : "500 Internal Server Error"}</h1>
                <span>{error.message}</span>
            </div>
        );

        return {
            component: <DefaultNotFound />,
            routeParams,
            module: { default: DefaultNotFound },
            serverRes: default_server_res,
        };
    }
}
