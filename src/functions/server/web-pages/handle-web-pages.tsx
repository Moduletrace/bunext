import type { GrabPageComponentRes } from "../../../types";
import isDevelopment from "../../../utils/is-development";
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
    });

    const res_opts: ResponseInit = {
        headers: {
            "Content-Type": "text/html",
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

    const res = new Response(html, res_opts);

    return res;
}
