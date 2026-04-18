import grabRouteParams from "../../utils/grab-route-params";
import grabConstants from "../../utils/grab-constants";
import grabRouter from "../../utils/grab-router";
import isDevelopment from "../../utils/is-development";
import _ from "lodash";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
const { ROOT_DIR } = grabDirNames();
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
    const routeParams = await grabRouteParams({
        req,
        query: match.query,
    });
    let module;
    const now = Date.now();
    if (is_dev && global.SSR_BUNDLER_CTX_MAP?.[match.filePath]?.path) {
        const target_import = path.join(ROOT_DIR, global.SSR_BUNDLER_CTX_MAP[match.filePath].path);
        module = await import(`${target_import}?t=${now}`);
    }
    else {
        const import_path = is_dev
            ? `${match.filePath}?t=${now}`
            : match.filePath;
        module = await import(import_path);
    }
    const config = module.config;
    const contentLength = req.headers.get("content-length");
    if (contentLength) {
        const size = parseInt(contentLength, 10);
        if ((config?.max_request_body_mb &&
            size > config.max_request_body_mb * MBInBytes) ||
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
    const target_module = (module["default"] ||
        module["handler"]);
    const res = await target_module?.({
        ...routeParams,
    });
    if (res instanceof Response) {
        if (is_dev) {
            res.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
        }
        return res;
    }
    if (res) {
        let final_res = Response.json(_.omit(res, [
            "bunext_api_route_res_options",
            "bunext_api_route_res_transform_fn",
        ]), {
            ...(res.bunext_api_route_res_options || undefined),
        });
        if (res.bunext_api_route_res_transform_fn) {
            final_res = await res.bunext_api_route_res_transform_fn(final_res);
        }
        return final_res;
    }
    return Response.json({ err: `Route handler error` });
}
// const relative_path = match.filePath.replace(API_DIR, "");
// const relative_module_js_file = relative_path.replace(/\.tsx?$/, ".js");
// const bun_module_file = path.join(
//     BUNX_CWD_MODULE_CACHE_DIR,
//     "api",
//     relative_module_js_file,
// );
// if (existsSync(bun_module_file)) {
//     module = await import(`${bun_module_file}?t=${now}`);
// } else {
//     const import_path = is_dev
//         ? `${match.filePath}?t=${now}`
//         : match.filePath;
//     module = await import(import_path);
// }
// if (is_dev) {
//     const tmp_path = `${match.filePath}.${now}${AppData["BunextTmpFileExt"]}`;
//     cpSync(match.filePath, tmp_path);
//     module = await import(`${tmp_path}?t=${now}`);
//     try {
//         unlinkSync(tmp_path);
//     } catch (error) {}
// } else {
//     // const import_path = is_dev ? `${match.filePath}?t=${now}` : match.filePath;
//     module = await import(match.filePath);
// }
// const import_path = is_dev ? `${match.filePath}?t=${now}` : match.filePath;
// module = await import(import_path);
