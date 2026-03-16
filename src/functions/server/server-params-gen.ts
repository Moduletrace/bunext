import path from "path";
import type { RouterTypes, ServeOptions } from "bun";
import grabAppPort from "../../utils/grab-app-port";
import grabDirNames from "../../utils/grab-dir-names";
import handleWebPages from "./web-pages/handle-web-pages";
import handleRoutes from "./handle-routes";
import isDevelopment from "../../utils/is-development";
import type { Server } from "http";

type Params = {
    dev?: boolean;
};

// type ServerOptions = Omit<ServeOptions, "fetch"> & {
//     routes: { [K: string]: RouterTypes.RouteValue<string> };
//     fetch?: (
//         this: Server,
//         request: Request,
//         server: Server,
//     ) => Response | Promise<Response>;
// };

export default async function (params?: Params): Promise<ServeOptions> {
    const port = grabAppPort();
    const { PUBLIC_DIR } = grabDirNames();

    // const opts: ServerOptions = {
    //     routes: {
    //         "/__hmr": {
    //             async GET(req) {
    //                 if (!isDevelopment()) {
    //                     return new Response(`Production Environment`);
    //                 }

    //                 let controller: ReadableStreamDefaultController<string>;
    //                 const stream = new ReadableStream<string>({
    //                     start(c) {
    //                         controller = c;
    //                         global.HMR_CONTROLLERS.add(c);
    //                     },
    //                     cancel() {
    //                         global.HMR_CONTROLLERS.delete(controller);
    //                     },
    //                 });

    //                 return new Response(stream, {
    //                     headers: {
    //                         "Content-Type": "text/event-stream",
    //                         "Cache-Control": "no-cache",
    //                         Connection: "keep-alive",
    //                     },
    //                 });
    //             },
    //         },
    //         "/api/*": {},
    //         "/*": {
    //             async GET(req) {
    //                 return await handleWebPages({ req });
    //             },
    //         },
    //     },
    // };

    return {
        async fetch(req, server) {
            try {
                const url = new URL(req.url);

                if (url.pathname === "/__hmr" && isDevelopment()) {
                    const referer_url = new URL(
                        req.headers.get("referer") || "",
                    );
                    const match = global.ROUTER.match(referer_url.pathname);

                    if (!match?.filePath) {
                        return new Response(`Unhandled Path.`);
                    }

                    const target_map = global.BUNDLER_CTX_MAP?.find(
                        (m) => m.local_path == match.filePath,
                    );

                    if (!target_map?.entrypoint) {
                        return new Response(`Target Path has no map`);
                    }

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
                    const res = await handleRoutes({ req, server });

                    return new Response(JSON.stringify(res), {
                        status: res?.status,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
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
