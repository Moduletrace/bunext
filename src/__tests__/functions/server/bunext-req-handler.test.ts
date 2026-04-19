import { describe, expect, test, mock, afterAll, beforeEach } from "bun:test";
import bunextRequestHandler from "../../../../src/functions/server/bunext-req-handler";

mock.module("../../../../src/utils/is-development", () => ({
    default: () => true
}));

mock.module("../../../../src/utils/grab-constants", () => ({
    default: () => ({
        config: {
            middleware: async ({ url }: any) => {
                if (url.pathname === "/blocked") {
                    return new Response("Blocked by middleware", { status: 403 });
                }
                return undefined;
            }
        }
    })
}));

mock.module("../../../../src/functions/server/handle-routes", () => ({
    default: async () => new Response("api-routes")
}));

mock.module("../../../../src/functions/server/handle-public", () => ({
    default: async () => new Response("public")
}));

mock.module("../../../../src/functions/server/handle-files", () => ({
    default: async () => new Response("files")
}));

mock.module("../../../../src/functions/server/web-pages/handle-web-pages", () => ({
    default: async () => new Response("web-pages")
}));

describe("bunext-req-handler", () => {
    beforeEach(() => {
        global.CONSTANTS = {
            config: {
                middleware: async ({ url }: any) => {
                    if (url.pathname === "/blocked") {
                        return new Response("Blocked by middleware", { status: 403 });
                    }
                    return undefined;
                }
            },
            RouteIgnorePatterns: [],
        } as any;
    });

    afterAll(() => {
        mock.restore();
    });

    test("middleware is caught", async () => {
        const req = new Request("http://localhost/blocked");
        const res = await bunextRequestHandler({ req });
        expect(res.status).toBe(403);
        expect(await res.text()).toBe("Blocked by middleware");
    });

    test("routes /__hmr to handleHmr in dev", async () => {
        global.ROUTER = { match: () => ({}) } as any;
        global.HMR_CONTROLLERS = [];
        const req = new Request("http://localhost/__hmr", {
            headers: { referer: "http://localhost/" }
        });
        const res = await bunextRequestHandler({ req });
        expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    });

    test("routes /api/ to handleRoutes", async () => {
        const req = new Request("http://localhost/api/users");
        const res = await bunextRequestHandler({ req });
        expect(await res.text()).toBe("api-routes");
    });

    test("routes /public/ to handlePublic", async () => {
        const req = new Request("http://localhost/public/image.png");
        const res = await bunextRequestHandler({ req });
        expect(await res.text()).toBe("public");
    });

    test("routes files like .js to handleFiles", async () => {
        const req = new Request("http://localhost/script.js");
        const res = await bunextRequestHandler({ req });
        expect(await res.text()).toBe("files");
    });

    test("routes anything else to handleWebPages", async () => {
        const req = new Request("http://localhost/about");
        const res = await bunextRequestHandler({ req });
        expect(await res.text()).toBe("web-pages");
    });
});
