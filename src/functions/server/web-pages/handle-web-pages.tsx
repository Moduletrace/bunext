import type { GrabPageComponentRes } from "../../../types";
import isDevelopment from "../../../utils/is-development";
import getCache from "../../cache/get-cache";
import writeCache from "../../cache/write-cache";
import genWebHTML from "./generate-web-html";
import grabPageComponent from "./grab-page-component";
import grabPageErrorComponent from "./grab-page-error-component";

type Params = {
    req: Request;
};

export default async function handleWebPages({
    req,
}: Params): Promise<Response> {
    try {
        if (!isDevelopment()) {
            const url = new URL(req.url);
            const key = url.pathname + (url.search || "");

            const existing_cache = getCache({ key, paradigm: "html" });

            if (existing_cache) {
                const res_opts: ResponseInit = {
                    headers: {
                        "Content-Type": "text/html",
                        "X-Bunext-Cache": "HIT",
                    },
                };

                return new Response(existing_cache, res_opts);
            }
        }

        const componentRes = await grabPageComponent({ req });
        return await generateRes(componentRes);
    } catch (error: any) {
        const componentRes = await grabPageErrorComponent({ error });
        return await generateRes(componentRes);
    }
}

async function generateRes({
    component,
    module,
    bundledMap,
    head,
    meta,
    routeParams,
    serverRes,
}: GrabPageComponentRes) {
    const html = await genWebHTML({
        component,
        pageProps: serverRes,
        bundledMap,
        module,
        meta,
        head,
        routeParams,
    });

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

    const cache_page =
        module.config?.cachePage || serverRes?.cachePage || false;
    const expiry_seconds = module.config?.cacheExpiry || serverRes?.cacheExpiry;

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
