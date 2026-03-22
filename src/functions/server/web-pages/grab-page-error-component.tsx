import type { FC } from "react";
import grabDirNames from "../../../utils/grab-dir-names";
import type {
    BundlerCTXMap,
    BunextPageModule,
    BunxRouteParams,
    GrabPageComponentRes,
} from "../../../types";

type Params = {
    error?: any;
    routeParams?: BunxRouteParams;
    is404?: boolean;
};

export default async function grabPageErrorComponent({
    error,
    routeParams,
    is404,
}: Params): Promise<GrabPageComponentRes> {
    const router = global.ROUTER;

    const { BUNX_ROOT_500_PRESET_COMPONENT, BUNX_ROOT_404_PRESET_COMPONENT } =
        grabDirNames();

    const errorRoute = is404 ? "/404" : "/500";
    const presetComponent = is404
        ? BUNX_ROOT_404_PRESET_COMPONENT
        : BUNX_ROOT_500_PRESET_COMPONENT;

    try {
        const match = router.match(errorRoute);
        const filePath = match?.filePath || presetComponent;

        const bundledMap = match?.filePath
            ? global.BUNDLER_CTX_MAP[match.filePath]
            : ({} as BundlerCTXMap);

        const module: BunextPageModule = await import(filePath);
        const Component = module.default as FC<any>;
        const component = <Component>{<span>{error.message}</span>}</Component>;

        return {
            component,
            routeParams,
            module,
            bundledMap,
            serverRes: {
                responseOptions: {
                    status: is404 ? 404 : 500,
                },
            } as any,
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
            bundledMap: {} as BundlerCTXMap,
            serverRes: {
                responseOptions: {
                    status: is404 ? 404 : 500,
                },
            } as any,
        };
    }
}
