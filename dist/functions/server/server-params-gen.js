import grabAppPort from "../../utils/grab-app-port";
import handleWebPages from "./web-pages/handle-web-pages";
import handleRoutes from "./handle-routes";
import isDevelopment from "../../utils/is-development";
import grabConstants from "../../utils/grab-constants";
import { AppData } from "../../data/app-data";
import handleHmr from "./handle-hmr";
import handleHmrUpdate from "./handle-hmr-update";
import handlePublic from "./handle-public";
import handleFiles from "./handle-files";
export default async function (params) {
    const port = grabAppPort();
    const is_dev = isDevelopment();
    return {
        async fetch(req, server) {
            try {
                const url = new URL(req.url);
                const { config } = grabConstants();
                let response = undefined;
                if (config?.middleware) {
                    const middleware_res = await config.middleware({
                        req,
                        url,
                        server,
                    });
                    if (typeof middleware_res == "object") {
                        return middleware_res;
                    }
                }
                if (url.pathname == `/${AppData["ClientHMRPath"]}`) {
                    response = await handleHmrUpdate({ req, server });
                }
                else if (url.pathname === "/__hmr" && is_dev) {
                    response = await handleHmr({ req, server });
                }
                else if (url.pathname.startsWith("/api/")) {
                    response = await handleRoutes({ req, server });
                }
                else if (url.pathname.startsWith("/public/")) {
                    response = await handlePublic({ req, server });
                }
                else if (url.pathname.match(/\..*$/)) {
                    response = await handleFiles({ req, server });
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
        },
        port,
        idleTimeout: 0,
        development: {
            hmr: true,
        },
    };
}
