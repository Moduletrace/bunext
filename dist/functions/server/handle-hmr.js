import grabRouteParams from "../../utils/grab-route-params";
import grabConstants from "../../utils/grab-constants";
import grabRouter from "../../utils/grab-router";
export default async function ({ req, server }) {
    const referer_url = new URL(req.headers.get("referer") || "");
    const match = global.ROUTER.match(referer_url.pathname);
    const target_map = match?.filePath
        ? global.BUNDLER_CTX_MAP?.find((m) => m.local_path == match.filePath)
        : undefined;
    let controller;
    const stream = new ReadableStream({
        start(c) {
            controller = c;
            global.HMR_CONTROLLERS.push({
                controller: c,
                page_url: referer_url.href,
                target_map,
            });
        },
        cancel() {
            const targetControllerIndex = global.HMR_CONTROLLERS.findIndex((c) => c.controller == controller);
            if (typeof targetControllerIndex == "number" &&
                targetControllerIndex >= 0) {
                global.HMR_CONTROLLERS.splice(targetControllerIndex, 1);
            }
        },
    });
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            Connection: "keep-alive",
        },
    });
}
