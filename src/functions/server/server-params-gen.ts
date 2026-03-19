import path from "path";
import type { ServeOptions } from "bun";
import grabAppPort from "../../utils/grab-app-port";
import grabDirNames from "../../utils/grab-dir-names";
import handleWebPages from "./web-pages/handle-web-pages";
import handleRoutes from "./handle-routes";
import isDevelopment from "../../utils/is-development";
import grabConstants from "../../utils/grab-constants";
import { AppData } from "../../data/app-data";
import { existsSync } from "fs";

type Params = {
    dev?: boolean;
};

export default async function (params?: Params): Promise<ServeOptions> {
    const port = grabAppPort();
    const { PUBLIC_DIR } = grabDirNames();

    const is_dev = isDevelopment();

    return {
        async fetch(req, server) {
            try {
                const url = new URL(req.url);

                const { config } = grabConstants();

                if (config?.middleware) {
                    const middleware_res = await config.middleware({
                        req,
                        url,
                        server,
                    });

                    if (typeof middleware_res == "object") {
                        return middleware_res;
                    }
                }

                if (url.pathname === "/__hmr" && is_dev) {
                    const referer_url = new URL(
                        req.headers.get("referer") || "",
                    );
                    const match = global.ROUTER.match(referer_url.pathname);

                    const target_map = match?.filePath
                        ? global.BUNDLER_CTX_MAP?.find(
                              (m) => m.local_path == match.filePath,
                          )
                        : undefined;

                    let controller: ReadableStreamDefaultController<string>;
                    const stream = new ReadableStream<string>({
                        start(c) {
                            controller = c;
                            global.HMR_CONTROLLERS.push({
                                controller: c,
                                page_url: referer_url.href,
                                target_map,
                            });
                        },
                        cancel() {
                            const targetControllerIndex =
                                global.HMR_CONTROLLERS.findIndex(
                                    (c) => c.controller == controller,
                                );

                            if (
                                typeof targetControllerIndex == "number" &&
                                targetControllerIndex >= 0
                            ) {
                                global.HMR_CONTROLLERS.splice(
                                    targetControllerIndex,
                                    1,
                                );
                            }
                        },
                    });

                    return new Response(stream, {
                        headers: {
                            "Content-Type": "text/event-stream",
                            "Cache-Control": "no-cache",
                            Connection: "keep-alive",
                        },
                    });
                }

                if (url.pathname.startsWith("/api/")) {
                    return await handleRoutes({ req, server });
                }

                if (url.pathname.startsWith("/public/")) {
                    try {
                        const file_path = path.join(
                            PUBLIC_DIR,
                            url.pathname.replace(/^\/public/, ""),
                        );

                        if (!existsSync(file_path)) {
                            return new Response(`Public File Doesn't Exist`, {
                                status: 404,
                            });
                        }

                        const file = Bun.file(file_path);

                        let res_opts: ResponseInit = {};

                        if (!is_dev && url.pathname.match(/__bunext/)) {
                            res_opts.headers = {
                                "Cache-Control": `public, max-age=${AppData["BunextStaticFilesCacheExpiry"]}, must-revalidate`,
                            };
                        }

                        return new Response(file, res_opts);
                    } catch (error) {
                        return new Response(`Public File Not Found`, {
                            status: 404,
                        });
                    }
                }

                // if (url.pathname.startsWith("/favicon.") ) {
                if (url.pathname.match(/\..*$/)) {
                    try {
                        const file_path = path.join(PUBLIC_DIR, url.pathname);

                        if (!existsSync(file_path)) {
                            return new Response(`File Doesn't Exist`, {
                                status: 404,
                            });
                        }

                        const file = Bun.file(file_path);
                        return new Response(file);
                    } catch (error) {
                        return new Response(`File Not Found`, { status: 404 });
                    }
                }

                return await handleWebPages({ req });
            } catch (error: any) {
                return new Response(`Server Error: ${error.message}`, {
                    status: 500,
                });
            }
        },
        port,
        idleTimeout: 0,
        development: {
            hmr: true,
        },
    } as ServeOptions;
}
