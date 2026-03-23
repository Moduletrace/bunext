import grabRouteParams from "../../utils/grab-route-params";
import grabConstants from "../../utils/grab-constants";
import grabRouter from "../../utils/grab-router";
import isDevelopment from "../../utils/is-development";
export default async function ({ req }) {
    const url = new URL(req.url);
    const is_dev = isDevelopment();
    const { MBInBytes, ServerDefaultRequestBodyLimitBytes } = grabConstants();
    const router = grabRouter();
    const match = router.match(url.pathname);
    if (!match?.filePath) {
        const errMsg = `Route ${url.pathname} not found`;
        return Response.json({
            success: false,
            msg: errMsg,
        }, {
            status: 404,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    const routeParams = await grabRouteParams({ req });
    const now = Date.now();
    const import_path = is_dev ? `${match.filePath}?t=${now}` : match.filePath;
    const module = await import(import_path);
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
    });
    if (is_dev) {
        res.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    }
    return res;
}
