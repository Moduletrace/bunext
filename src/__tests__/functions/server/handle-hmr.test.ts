import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import handleHmr from "../../../../src/functions/server/handle-hmr";

describe("handle-hmr", () => {
    beforeEach(() => {
        global.ROUTER = {
            match: (path: string) => {
                if (path === "/test") return { filePath: "/test-file" };
                return null;
            }
        } as any;
        global.HMR_CONTROLLERS = [];
        global.BUNDLER_CTX_MAP = [
            { local_path: "/test-file" } as any
        ];
    });

    afterEach(() => {
        global.ROUTER = undefined as any;
        global.HMR_CONTROLLERS = [];
        global.BUNDLER_CTX_MAP = undefined as any;
    });

    test("sets up SSE stream and pushes to HMR_CONTROLLERS", async () => {
        const req = new Request("http://localhost/hmr", {
            headers: {
                "referer": "http://localhost/test"
            }
        });

        const res = await handleHmr({ req });

        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/event-stream");
        expect(res.headers.get("Connection")).toBe("keep-alive");

        expect(global.HMR_CONTROLLERS.length).toBe(1);
        const controller = global.HMR_CONTROLLERS[0];
        expect(controller.page_url).toBe("http://localhost/test");
        expect(controller.target_map?.local_path).toBe("/test-file");
    });
});
