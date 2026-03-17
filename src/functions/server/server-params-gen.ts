import path from "path";
import type { ServeOptions } from "bun";
import grabAppPort from "../../utils/grab-app-port";
import grabDirNames from "../../utils/grab-dir-names";
import handleWebPages from "./web-pages/handle-web-pages";
import handleRoutes from "./handle-routes";
import isDevelopment from "../../utils/is-development";
import grabConstants from "../../utils/grab-constants";

type Params = {
    dev?: boolean;
};

export default async function (params?: Params): Promise<ServeOptions> {
    const port = grabAppPort();
    const { PUBLIC_DIR } = grabDirNames();

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

                if (url.pathname === "/__hmr" && isDevelopment()) {
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
                    const file = Bun.file(
                        path.join(
                            PUBLIC_DIR,
                            url.pathname.replace(/^\/public/, ""),
                        ),
                    );

                    return new Response(file);
                }

                if (url.pathname.startsWith("/favicon.")) {
                    const file = Bun.file(path.join(PUBLIC_DIR, url.pathname));

                    return new Response(file);
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
