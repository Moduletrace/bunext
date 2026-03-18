import grabRouteParams from "../../utils/grab-route-params";
import grabConstants from "../../utils/grab-constants";
import grabRouter from "../../utils/grab-router";
export default async function ({ req, server }) {
    const url = new URL(req.url);
    const { MBInBytes, ServerDefaultRequestBodyLimitBytes } = grabConstants();
    const router = grabRouter();
    const match = router.match(url.pathname);
    if (!match?.filePath) {
        const errMsg = `Route ${url.pathname} not found`;
        return Response.json({
            success: false,
            msg: errMsg,
        }, {
            status: 401,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    const routeParams = await grabRouteParams({ req });
    const module = await import(match.filePath);
    const config = module.config;
    const contentLength = req.headers.get("content-length");
    if (contentLength) {
        const size = parseInt(contentLength, 10);
        if ((config?.maxRequestBodyMB &&
            size > config.maxRequestBodyMB * MBInBytes) ||
            size > ServerDefaultRequestBodyLimitBytes) {
            return Response.json({
                success: false,
                msg: "Request Body Too Large!",
            }, {
                status: 413,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }
    }
    const res = await module["default"]({
        ...routeParams,
        server,
    });
    return res;
}
