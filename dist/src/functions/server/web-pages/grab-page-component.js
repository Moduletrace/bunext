import { jsx as _jsx } from "react/jsx-runtime";
import grabDirNames from "../../../utils/grab-dir-names";
import grabPageName from "../../../utils/grab-page-name";
import grabRouteParams from "../../../utils/grab-route-params";
import grabRouter from "../../../utils/grab-router";
import bundle from "../../../utils/bundle";
export default async function grabPageComponent({ req, file_path: passed_file_path, }) {
    const url = req?.url ? new URL(req.url) : undefined;
    const router = grabRouter();
    const { BUNX_ROOT_500_PRESET_COMPONENT, HYDRATION_DST_DIR, BUNX_ROOT_500_FILE_NAME, } = grabDirNames();
    const routeParams = req ? await grabRouteParams({ req }) : undefined;
    try {
        const match = url ? router.match(url.pathname) : undefined;
        if (!match?.filePath && url?.pathname) {
            const errMsg = `Page ${url.pathname} not found`;
            console.error(errMsg);
            throw new Error(errMsg);
        }
        const file_path = match?.filePath || passed_file_path;
        if (!file_path) {
            const errMsg = `No File Path (\`file_path\`) or Request Object (\`req\`) provided not found`;
            console.error(errMsg);
            throw new Error(errMsg);
        }
        const pageName = grabPageName({ path: file_path });
        const module = await import(`${file_path}?t=${global.LAST_BUILD_TIME ?? 0}`);
        const serverRes = await (async () => {
            try {
                if (routeParams) {
                    return await module["server"]?.(routeParams);
                }
                return {};
            }
            catch (error) {
                return {};
            }
        })();
        const Component = module.default;
        const component = _jsx(Component, { ...serverRes });
        return { component, serverRes, routeParams, pageName, module };
    }
    catch (error) {
        const match = router.match("/500");
        const filePath = match?.filePath || BUNX_ROOT_500_PRESET_COMPONENT;
        // if (!match?.filePath) {
        //     bundle({
        //         out_dir: HYDRATION_DST_DIR,
        //         src: `${BUNX_ROOT_500_PRESET_COMPONENT}`,
        //         debug: true,
        //     });
        // }
        const module = await import(`${filePath}?t=${global.LAST_BUILD_TIME ?? 0}`);
        const Component = module.default;
        const component = _jsx(Component, {});
        return {
            component,
            pageName: BUNX_ROOT_500_FILE_NAME,
            routeParams,
            module,
        };
    }
}
