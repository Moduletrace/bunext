import _ from "lodash";
import type { GrabPageComponentRes } from "../../../types";
import isDevelopment from "../../../utils/is-development";
import { log } from "../../../utils/log";
import genWebHTML from "./generate-web-html";
import generateWebPageGetCachePage from "./generate-web-page-get-cache-page";

export default async function generateWebPageResponseFromComponentReturn({
    component,
    module,
    bundledMap,
    routeParams,
    serverRes,
    debug,
    root_module,
}: GrabPageComponentRes) {
    const is_dev = isDevelopment();

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

    if (is_dev) {
        res_opts.headers = {
            ...res_opts.headers,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
        };
    }

    if (!is_dev) {
        await generateWebPageGetCachePage({
            html,
            module,
            root_module,
            routeParams,
            serverRes,
        });
    }

    const res = new Response(html, res_opts);

    if (routeParams?.resTransform) {
        return await routeParams.resTransform(res);
    }

    return res;
}
