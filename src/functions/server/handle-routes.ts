import type { Server } from "bun";
import type { BunextServerRouteConfig, BunxRouteParams } from "../../types";
import grabRouteParams from "../../utils/grab-route-params";
import grabConstants from "../../utils/grab-constants";
import grabRouter from "../../utils/grab-router";

type Params = {
    req: Request;
    server: Server;
};

export default async function ({ req, server }: Params): Promise<Response> {
    const url = new URL(req.url);

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
                status: 401,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    }

    const routeParams: BunxRouteParams = await grabRouteParams({ req });

    const module = await import(match.filePath);
    const config = module.config as BunextServerRouteConfig | undefined;

    const contentLength = req.headers.get("content-length");

    if (contentLength) {
        const size = parseInt(contentLength, 10);

        if (
            (config?.maxRequestBodyMB &&
                size > config.maxRequestBodyMB * MBInBytes) ||
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

    const res: Response = await module["default"]({
        ...routeParams,
        server,
    } as BunxRouteParams);

    return res;
}
