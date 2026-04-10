import type {
    BunextAPIRouteHandler,
    BunextServerRouteConfig,
    BunxRouteParams,
} from "../../types";
import grabRouteParams from "../../utils/grab-route-params";
import grabConstants from "../../utils/grab-constants";
import grabRouter from "../../utils/grab-router";
import isDevelopment from "../../utils/is-development";

type Params = {
    req: Request;
};

export default async function ({ req }: Params): Promise<Response> {
    const url = new URL(req.url);
    const is_dev = isDevelopment();

    const { MBInBytes, ServerDefaultRequestBodyLimitBytes } = grabConstants();

    const router = grabRouter();

    const match = router.match(url.pathname);

    if (!match?.filePath) {
        const errMsg = `Route ${url.pathname} not found`;

        return Response.json(
            {
                success: false,
                msg: errMsg,
            },
            {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    }

    const routeParams: BunxRouteParams = await grabRouteParams({ req });

    const now = Date.now();
    const import_path = is_dev ? `${match.filePath}?t=${now}` : match.filePath;

    const module = await import(import_path);
    const config = module.config as BunextServerRouteConfig | undefined;

    const contentLength = req.headers.get("content-length");

    if (contentLength) {
        const size = parseInt(contentLength, 10);

        if (
            (config?.max_request_body_mb &&
                size > config.max_request_body_mb * MBInBytes) ||
            size > ServerDefaultRequestBodyLimitBytes
        ) {
            return Response.json(
                {
                    success: false,
                    msg: "Request Body Too Large!",
                },
                {
                    status: 413,
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );
        }
    }

    const target_module = (module["default"] ||
        module["handler"]) as BunextAPIRouteHandler;

    const res = await target_module?.({
        ...routeParams,
    });

    if (res instanceof Response) {
        if (is_dev) {
            res.headers.set(
                "Cache-Control",
                "no-cache, no-store, must-revalidate",
            );
        }
        return res;
    }

    return Response.json(res, {
        ...(res.bunext_api_route_res_options || undefined),
    });
}
