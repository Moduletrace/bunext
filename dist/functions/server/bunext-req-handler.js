import handleWebPages from "./web-pages/handle-web-pages";
import handleRoutes from "./handle-routes";
import isDevelopment from "../../utils/is-development";
import grabConstants from "../../utils/grab-constants";
import handleHmr from "./handle-hmr";
import handlePublic from "./handle-public";
import handleFiles from "./handle-files";
import handleBunextPublicAssets from "./handle-bunext-public-assets";
export default async function bunextRequestHandler({ req: initial_req, }) {
    const is_dev = isDevelopment();
    let req = initial_req.clone();
    try {
        const url = new URL(req.url);
        const { config } = grabConstants();
        let response = undefined;
        if (config?.middleware) {
            const middleware_res = await config.middleware({
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
        if (url.pathname === "/__hmr" && is_dev) {
            response = await handleHmr({ req });
        }
        else if (url.pathname.startsWith("/.bunext/public/pages")) {
            response = await handleBunextPublicAssets({ req });
        }
        else if (url.pathname.startsWith("/api/")) {
            response = await handleRoutes({ req });
        }
        else if (url.pathname.startsWith("/public/")) {
            response = await handlePublic({ req });
        }
        else if (url.pathname.match(/\..*$/)) {
            response = await handleFiles({ req });
        }
        else {
            response = await handleWebPages({ req });
        }
        if (!response) {
            throw new Error(`No Response generated`);
        }
        if (is_dev) {
            response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
        }
        return response;
    }
    catch (error) {
        return new Response(`Server Error: ${error.message}`, {
            status: 500,
        });
    }
}
