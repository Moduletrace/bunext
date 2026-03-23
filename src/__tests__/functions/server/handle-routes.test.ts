import { describe, expect, test, mock, afterAll } from "bun:test";
import handleRoutes from "../../../../src/functions/server/handle-routes";

mock.module("../../../../src/utils/is-development", () => ({
    default: () => false
}));

mock.module("../../../../src/utils/grab-constants", () => ({
    default: () => ({ MBInBytes: 1048576, ServerDefaultRequestBodyLimitBytes: 5242880 })
}));

mock.module("../../../../src/utils/grab-router", () => ({
    default: () => ({
        match: (path: string) => {
            if (path === "/api/test") return { filePath: "/test-path" };
            if (path === "/api/large") return { filePath: "/large-path" };
            return null;
        }
    })
}));

mock.module("../../../../src/utils/grab-route-params", () => ({
    default: async () => ({ params: {}, searchParams: {} })
}));

mock.module("/test-path", () => ({
    default: async () => new Response("OK", { status: 200 })
}));

mock.module("/large-path", () => ({
    default: async () => new Response("Large OK", { status: 200 }),
    config: { maxRequestBodyMB: 1 }
}));

/**
 * Tests for routing logic within `handle-routes`.
 */
describe("handle-routes", () => {
    afterAll(() => {
        mock.restore();
    });

    test("returns 404 for unknown route", async () => {
        const req = new Request("http://localhost/api/unknown");
        const res = await handleRoutes({ req });

        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.msg).toContain("not found");
    });

    test("calls matched module default export", async () => {
        const req = new Request("http://localhost/api/test");
        const res = await handleRoutes({ req });
        
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("OK");
    });

    test("enforces request body size limits", async () => {
        // limit is 1MB from mock config
        const req = new Request("http://localhost/api/large", {
            method: "POST",
            headers: {
                "content-length": "2000000" // ~2MB
            },
            body: "x".repeat(10) // the actual body doesn't matter since handleRoutes only checks the header
        });
        const res = await handleRoutes({ req });
        
        expect(res.status).toBe(413);
        const json = await res.json();
        expect(json.success).toBe(false);
    });
});
