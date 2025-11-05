import grabDirNames from "../../utils/grab-dir-names";
import type { GetRouteReturn } from "../../types";
import grabAssetsPrefix from "../../utils/grab-assets-prefix";
import grabOrigin from "../../utils/grab-origin";

type Params = {
    route: string;
};

export default async function getRoute({
    route,
}: Params): Promise<GetRouteReturn | null> {
    const { pagesDir } = grabDirNames();

    if (route.match(/\(/)) {
        return null;
    }

    const assetPrefix = grabAssetsPrefix();
    const origin = grabOrigin();

    const router = new Bun.FileSystemRouter({
        style: "nextjs",
        dir: pagesDir,
        origin,
        assetPrefix,
    });

    const match = router.match(route);

    if (!match?.filePath) {
        console.error(`Route ${route} not found`);
        return null;
    }

    const module = await import(match.filePath);

    return {
        match,
        module,
        component: module.default,
        serverProps: module.serverProps,
        staticProps: module.staticProps,
        staticPaths: module.staticPaths,
        staticParams: module.staticParams,
    };
}
