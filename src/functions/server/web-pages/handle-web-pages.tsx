import isDevelopment from "../../../utils/is-development";
import genWebHTML from "./generate-web-html";
import grabPageComponent from "./grab-page-component";

type Params = {
    req: Request;
};

export default async function ({ req }: Params): Promise<Response> {
    try {
        const { component, pageName, module, serverRes } =
            await grabPageComponent({ req });

        const html = await genWebHTML({
            component,
            pageProps: serverRes,
            pageName,
            module,
        });

        // writeWebPageHydrationScript({
        //     component,
        //     pageName,
        //     module,
        //     pageProps: serverRes,
        // });

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
    } catch (error: any) {
        return new Response(error.message || `Page Not Found`, {
            status: 404,
        });
    }
}
