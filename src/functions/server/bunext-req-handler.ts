import handleWebPages from "./web-pages/handle-web-pages";
import handleRoutes from "./handle-routes";
import isDevelopment from "../../utils/is-development";
import handleHmr from "./handle-hmr";
import handlePublic from "./handle-public";
import handleFiles from "./handle-files";
import handleBunextPublicAssets from "./handle-bunext-public-assets";
import checkExcludedPatterns from "../../utils/check-excluded-patterns";
import { AppData } from "../../data/app-data";
import fullRebuild from "./full-rebuild";
type Params = {
    req: Request;
    server: Bun.Server<any>;
};

export default async function bunextRequestHandler({
    req: initial_req,
    server,
}: Params): Promise<Response> {
    const is_dev = isDevelopment();
    let req = initial_req.clone();

    try {
        const url = new URL(req.url);

        if (checkExcludedPatterns({ path: url.pathname })) {
            return Response.json({ success: false, msg: `Invalid Path` });
        }

        let response: Response | undefined = undefined;

        if (global.CONSTANTS.config?.middleware) {
            const middleware_res = await global.CONSTANTS.config.middleware({
                req: initial_req,
                url,
            });

            if (middleware_res instanceof Response) {
                return middleware_res;
            }

            if (middleware_res instanceof Request) {
                req = middleware_res;
            }
        }

        if (is_dev && url.pathname == AppData["BunextHMRRetryRoute"]) {
            await fullRebuild({ msg: `HMR Retry Rebuild ...` });
            return new Response("Modules Rebuilt");
        }

        if (url.pathname === "/__hmr" && is_dev) {
            response = await handleHmr({ req });
        } else if (url.pathname.startsWith("/.bunext")) {
            response = await handleBunextPublicAssets({ req });
        } else if (url.pathname.startsWith("/api/")) {
            response = await handleRoutes({ req });
        } else if (url.pathname.startsWith("/public/")) {
            response = await handlePublic({ req });
        } else if (url.pathname.match(/\..*$/)) {
            response = await handleFiles({ req });
        } else {
            response = await handleWebPages({ req });
        }

        if (!response) {
            throw new Error(`No Response generated`);
        }

        if (is_dev) {
            response.headers.set(
                "Cache-Control",
                "no-cache, no-store, must-revalidate",
            );
        }

        return response;
    } catch (error: any) {
        return new Response(`Server Error: ${error.message}`, {
            status: 500,
        });
    }
}
