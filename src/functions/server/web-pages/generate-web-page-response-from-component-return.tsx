import _ from "lodash";
import type { GrabPageComponentRes } from "../../../types";
import isDevelopment from "../../../utils/is-development";
import { log } from "../../../utils/log";
import writeCache from "../../cache/write-cache";
import genWebHTML from "./generate-web-html";

export default async function generateWebPageResponseFromComponentReturn({
    component,
    module,
    bundledMap,
    routeParams,
    serverRes,
    debug,
    root_module,
}: GrabPageComponentRes) {
    const html = await genWebHTML({
        component,
        pageProps: serverRes,
        bundledMap,
        module,
        routeParams,
        debug,
        root_module,
    });

    if (debug) {
        log.info("html", html);
    }

    if (serverRes?.redirect?.destination) {
        return Response.redirect(
            serverRes.redirect.destination,
            serverRes.redirect.permanent
                ? 301
                : serverRes.redirect.status_code || 302,
        );
    }

    const res_opts: ResponseInit = {
        ...serverRes?.responseOptions,
        headers: {
            "Content-Type": "text/html",
            ...serverRes?.responseOptions?.headers,
        },
    };

    if (isDevelopment()) {
        res_opts.headers = {
            ...res_opts.headers,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
        };
    }

    const config = _.merge(root_module?.config, module.config);

    const cache_page = config?.cachePage || serverRes?.cachePage || false;
    const expiry_seconds = config?.cacheExpiry || serverRes?.cacheExpiry;

    if (cache_page && routeParams?.url) {
        const key = routeParams.url.pathname + (routeParams.url.search || "");
        writeCache({
            key,
            value: html,
            paradigm: "html",
            expiry_seconds,
        });
    }

    const res = new Response(html, res_opts);

    if (routeParams?.resTransform) {
        return await routeParams.resTransform(res);
    }

    return res;
}
