import type { FC } from "react";
import grabDirNames from "../../../utils/grab-dir-names";
import grabRouteParams from "../../../utils/grab-route-params";
import grabRouter from "../../../utils/grab-router";
import type { BunextPageModule, GrabPageComponentRes } from "../../../types";
import path from "path";
import AppNames from "../../../utils/grab-app-names";
import { existsSync } from "fs";

type Params = {
    req?: Request;
    file_path?: string;
};

export default async function grabPageComponent({
    req,
    file_path: passed_file_path,
}: Params): Promise<GrabPageComponentRes> {
    const url = req?.url ? new URL(req.url) : undefined;
    const router = grabRouter();

    const { BUNX_ROOT_500_PRESET_COMPONENT, PAGES_DIR } = grabDirNames();

    const routeParams = req ? await grabRouteParams({ req }) : undefined;

    try {
        const match = url ? router.match(url.pathname) : undefined;

        if (!match?.filePath && url?.pathname) {
            const errMsg = `Page ${url.pathname} not found`;
            // console.error(errMsg);
            throw new Error(errMsg);
        }

        const file_path = match?.filePath || passed_file_path;

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

        const RootComponent = root_module?.default as FC<any> | undefined;

        // const component_file_path = root_module
        //     ? `${file_path}`
        //     : `${file_path}?t=${global.LAST_BUILD_TIME ?? 0}`;

        const module: BunextPageModule = await import(`${file_path}?t=${now}`);

        const serverRes = await (async () => {
            try {
                if (routeParams) {
                    return await module["server"]?.(routeParams);
                }
                return {};
            } catch (error) {
                return {};
            }
        })();

        const Component = module.default as FC<any>;

        const component = RootComponent ? (
            <RootComponent {...serverRes}>
                <Component {...serverRes} />
            </RootComponent>
        ) : (
            <Component {...serverRes} />
        );

        return {
            component,
            serverRes,
            routeParams,
            module,
            bundledMap,
        };
    } catch (error: any) {
        // console.log(`Grab page component ERROR =>`, error.message);

        const match = router.match("/500");

        const filePath = match?.filePath || BUNX_ROOT_500_PRESET_COMPONENT;

        const module: BunextPageModule = await import(filePath);

        const Component = module.default as FC<any>;
        const component = <Component />;

        return {
            component,
            routeParams,
            module,
            bundledMap: {},
        };
    }
}
