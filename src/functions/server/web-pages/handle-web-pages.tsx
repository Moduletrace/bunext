import type { FC } from "react";
import grabDirNames from "../../../utils/grab-dir-names";
import type { Server } from "bun";
import grabPageName from "../../../utils/grab-page-name";
import grabRouteParams from "../../../utils/grab-route-params";
import genWebHTML from "./generate-web-html";
import grabRouter from "../../../utils/grab-router";
import type { BunextPageModule } from "../../../types";

type Params = {
    req: Request;
    server: Server;
};

export default async function ({ req, server }: Params): Promise<Response> {
    const url = new URL(req.url);

    try {
        const router = grabRouter();
        const match = router.match(url.pathname);

        if (!match?.filePath) {
            const errMsg = `Page ${url.pathname} not found`;
            console.error(errMsg);
            throw new Error(errMsg);
        }

        const pageName = grabPageName({ path: match.filePath });

        const module: BunextPageModule = await import(match.filePath);
        // const config = module.config as ServerRouteConfig | undefined;

        const routeParams = await grabRouteParams({ req, server });

        const serverRes = await (async () => {
            try {
                return await module["server"]?.(routeParams);
            } catch (error) {
                return {};
            }
        })();

        const Component = module.default as FC<any>;
        const component = <Component pageProps={serverRes} />;

        const html = await genWebHTML({
            component,
            pageProps: serverRes,
            pageName,
            module,
        });

        return new Response(html, {
            headers: {
                "Content-Type": "text/html",
            },
        });
    } catch (error) {
        return new Response(`Page Not Found`, {
            status: 404,
        });
    }
}
