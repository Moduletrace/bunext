import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";

const grabPageComponent = mock(async () => ({
    serverRes: { props: { ok: true } },
}));

mock.module(
    "../../../functions/server/web-pages/grab-page-component",
    () => ({
        default: grabPageComponent,
    }),
);

const { default: serverPostBuildFn } = await import(
    "../../../functions/server/server-post-build-fn"
);

function makeController(page_url: string, target_map?: { local_path: string }) {
    const enqueued: string[] = [];
    return {
        controller: {
            enqueue: (chunk: string) => {
                enqueued.push(chunk);
            },
        } as any,
        page_url,
        target_map: target_map as any,
        enqueued,
    };
}

describe("server-post-build-fn", () => {
    beforeEach(() => {
        grabPageComponent.mockClear();
        global.ROUTER = {
            match: (path: string) => {
                if (path === "/about") return { filePath: "/pages/about.tsx" };
                if (path === "/404") return { filePath: "/pages/404.tsx" };
                if (path === "/new-page")
                    return { filePath: "/pages/new-page.tsx" };
                return null;
            },
        } as any;
        global.BUNDLER_CTX_MAP = {
            "/pages/about.tsx": {
                local_path: "/pages/about.tsx",
                path: "pages/about.js",
            } as any,
            "/pages/404.tsx": {
                local_path: "/pages/404.tsx",
                path: "pages/404.js",
            } as any,
            "/pages/new-page.tsx": {
                local_path: "/pages/new-page.tsx",
                path: "pages/new-page.js",
            } as any,
        };
        global.HMR_CONTROLLERS = [];
        global.ROOT_FILE_UPDATED = false;
    });

    afterEach(() => {
        global.ROUTER = undefined as any;
        global.BUNDLER_CTX_MAP = undefined as any;
        global.HMR_CONTROLLERS = [];
    });

    test("soft-updates a normal page controller", async () => {
        const c = makeController("http://localhost/about", {
            local_path: "/pages/about.tsx",
        });
        global.HMR_CONTROLLERS = [c as any];

        await serverPostBuildFn();

        expect(c.enqueued.length).toBe(1);
        expect(c.enqueued[0]).toContain("event: update");
        expect(c.enqueued[0]).not.toContain('"reload":true');
        expect(c.enqueued[0]).toContain("/pages/about.tsx");
    });

    test("soft-updates unmatched URL via custom 404 artifact", async () => {
        const c = makeController("http://localhost/missing", {
            local_path: "/pages/404.tsx",
        });
        global.HMR_CONTROLLERS = [c as any];

        await serverPostBuildFn();

        expect(c.enqueued.length).toBe(1);
        expect(c.enqueued[0]).not.toContain('"reload":true');
        expect(c.enqueued[0]).toContain("/pages/404.tsx");
        expect(grabPageComponent).toHaveBeenCalled();
    });

    test("full-reloads when a previously unmatched route now exists", async () => {
        const c = makeController("http://localhost/new-page", {
            local_path: "/pages/404.tsx",
        });
        global.HMR_CONTROLLERS = [c as any];

        await serverPostBuildFn();

        expect(c.enqueued.length).toBe(1);
        expect(c.enqueued[0]).toContain('"reload":true');
        expect(c.target_map?.local_path).toBe("/pages/new-page.tsx");
    });

    test("full-reloads unmatched tab with no prior map when route appears", async () => {
        const c = makeController("http://localhost/new-page");
        global.HMR_CONTROLLERS = [c as any];

        await serverPostBuildFn();

        expect(c.enqueued.length).toBe(1);
        expect(c.enqueued[0]).toContain('"reload":true');
    });

    test("full-reloads preset 404 tabs with no custom 404 page", async () => {
        global.ROUTER = {
            match: () => null,
        } as any;
        const c = makeController("http://localhost/missing");
        global.HMR_CONTROLLERS = [c as any];

        await serverPostBuildFn();

        expect(c.enqueued.length).toBe(1);
        expect(c.enqueued[0]).toContain('"reload":true');
    });
});
