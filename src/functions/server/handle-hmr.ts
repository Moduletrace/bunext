type Params = {
    req: Request;
};

export default async function ({ req }: Params): Promise<Response> {
    const referer_url = new URL(req.headers.get("referer") || "");
    const match = global.ROUTER.match(referer_url.pathname);

    const target_map = match?.filePath
        ? global.BUNDLER_CTX_MAP[match.filePath]
        : undefined;

    let controller: ReadableStreamDefaultController<string>;
    let heartbeat: ReturnType<typeof setInterval>;
    const stream = new ReadableStream<string>({
        start(c) {
            controller = c;
            global.HMR_CONTROLLERS.push({
                controller: c,
                page_url: referer_url.href,
                target_map,
            });
            heartbeat = setInterval(() => {
                try {
                    c.enqueue(": keep-alive\n\n");
                } catch {
                    clearInterval(heartbeat);
                }
            }, 5000);
        },
        cancel() {
            clearInterval(heartbeat);
            const targetControllerIndex = global.HMR_CONTROLLERS.findIndex(
                (c) => c.controller == controller,
            );

            if (
                typeof targetControllerIndex == "number" &&
                targetControllerIndex >= 0
            ) {
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
