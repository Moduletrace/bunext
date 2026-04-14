import isDevelopment from "../../../utils/is-development";
import { log } from "../../../utils/log";
import getCache from "../../cache/get-cache";
import generateWebPageResponseFromComponentReturn from "./generate-web-page-response-from-component-return";
import grabPageComponent from "./grab-page-component";
import grabPageErrorComponent from "./grab-page-error-component";

type Params = {
    req: Request;
};

export default async function handleWebPages({
    req,
}: Params): Promise<Response> {
    try {
        const is_dev = isDevelopment();

        if (!is_dev) {
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

        const componentRes = await grabPageComponent({
            req,
        });

        if (componentRes instanceof Response) {
            return componentRes;
        }

        return await generateWebPageResponseFromComponentReturn({
            ...componentRes,
        });
    } catch (error: any) {
        log.error(`Error Handling Web Page: ${error.message}`, error);

        const componentRes = await grabPageErrorComponent({
            error,
        });

        if (componentRes instanceof Response) {
            return componentRes;
        }

        return await generateWebPageResponseFromComponentReturn(componentRes);
    }
}
