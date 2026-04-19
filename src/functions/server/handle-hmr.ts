type Params = {
    req: Request;
};

function removeController(controller: ReadableStreamDefaultController<string>) {
    const idx = global.HMR_CONTROLLERS.findIndex(
        (c) => c.controller == controller,
    );
    if (typeof idx == "number" && idx >= 0) {
        global.HMR_CONTROLLERS.splice(idx, 1);
    }
}

export default async function ({ req }: Params): Promise<Response> {
    const referer = req.headers.get("referer");
    if (!referer) {
        return new Response("Missing Referer Header", { status: 400 });
    }

    let referer_url: URL;
    try {
        referer_url = new URL(referer);
    } catch {
        return new Response("Invalid Referer Header", { status: 400 });
    }

    const match = global.ROUTER.match(referer_url.pathname);

    const target_map = match?.filePath
        ? global.BUNDLER_CTX_MAP?.[match.filePath]
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
                    removeController(controller);
                }
            }, 5000);
        },
        cancel() {
            clearInterval(heartbeat);
            removeController(controller);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            Connection: "keep-alive",
        },
    });
}
