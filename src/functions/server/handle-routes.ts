import type { Server } from "bun";
import type {
    APIResponseObject,
    BunextServerRouteConfig,
    BunxRouteParams,
} from "../../types";
import grabRouteParams from "../../utils/grab-route-params";
import grabConstants from "../../utils/grab-constants";
import grabRouter from "../../utils/grab-router";

type Params = {
    req: Request;
    server: Server;
};

export default async function ({
    req,
    server,
}: Params): Promise<APIResponseObject | undefined> {
    const url = new URL(req.url);

    const { MBInBytes, ServerDefaultRequestBodyLimitBytes } =
        await grabConstants();

    const router = grabRouter();

    const match = router.match(url.pathname);

    if (!match?.filePath) {
        const errMsg = `Route ${url.pathname} not found`;
        // console.error(errMsg);

        return {
            success: false,
            status: 401,
            msg: errMsg,
        };
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
            return {
                success: false,
                status: 413,
                msg: "Request Body Too Large!",
            };
        }
    }

    const res: APIResponseObject = await module["default"](
        routeParams as BunxRouteParams,
    );

    return res;
}
