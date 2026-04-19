import { afterEach, describe, expect, mock, test } from "bun:test";
import path from "path";

mock.module("../../../../src/utils/log", () => ({
    log: {
        info: mock((msg: string) => {}),
        error: mock((msg: string) => {}),
    },
}));

mock.module("../../../../src/utils/is-development", () => ({
    default: () => false
}));

mock.module("../../../../src/functions/server/full-rebuild", () => ({
    default: async () => {}
}));

mock.module("../../../../src/functions/server/server-post-build-fn", () => ({
    default: async () => {}
}));

import { log } from "../../../../src/utils/log";
import grabPageComponent from "../../../../src/functions/server/web-pages/grab-page-component";

describe("grabPageComponent", () => {
    const originalRouter = global.ROUTER;

    afterEach(() => {
        global.ROUTER = originalRouter;
        mock.restore();
    });

    test("does not log an error for expected 404 page lookups", async () => {
        global.ROUTER = new Bun.FileSystemRouter({
            style: "nextjs",
            dir: path.resolve(__dirname, "../../../../test/e2e-fixture/src/pages"),
        });

        const res = await grabPageComponent({
            req: new Request("http://localhost:3000/unknown-foo-bar123"),
        });

        expect(res.serverRes?.response_options?.status).toBe(404);
        expect(log.error).not.toHaveBeenCalled();
    });
});
