import path from "path";
import type { ServeOptions } from "bun";
import grabAppPort from "../../utils/grab-app-port";
import grabDirNames from "../../utils/grab-dir-names";
import handleWebPages from "./web-pages/handle-web-pages";
import handleRoutes from "./handle-routes";
import isDevelopment from "../../utils/is-development";

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

                if (url.pathname === "/__hmr" && isDevelopment()) {
                    let controller: ReadableStreamDefaultController<string>;
                    const stream = new ReadableStream<string>({
                        start(c) {
                            controller = c;
                            global.HMR_CONTROLLERS.add(c);
                        },
                        cancel() {
                            global.HMR_CONTROLLERS.delete(controller);
                        },
                    });

                    return new Response(stream, {
                        headers: {
                            "Content-Type": "text/event-stream",
                            "Cache-Control": "no-cache",
                            Connection: "keep-alive",
                        },
                    });
                } else if (url.pathname.startsWith("/api/")) {
                    const res = await handleRoutes({ req, server });

                    return new Response(JSON.stringify(res), {
                        status: res?.status,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                } else if (url.pathname.startsWith("/public/")) {
                    const file = Bun.file(
                        path.join(
                            PUBLIC_DIR,
                            url.pathname.replace(/^\/public/, ""),
                        ),
                    );

                    return new Response(file);
                } else if (url.pathname.startsWith("/favicon.")) {
                    const file = Bun.file(path.join(PUBLIC_DIR, url.pathname));

                    return new Response(file);
                } else {
                    return await handleWebPages({ req });
                }
            } catch (error: any) {
                return new Response(`Server Error: ${error.message}`, {
                    status: 500,
                });
            }
        },
        port,
        idleTimeout: 0,
    } as ServeOptions;
}
