import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import startServer from "../../../src/functions/server/start-server";
import path from "path";
import fs from "fs";

// Fixture lives under test/ so the framework's directory guard allows it
const fixtureDir = path.resolve(__dirname, "../../../test/e2e-fixture");
const fixturePagesDir = path.join(fixtureDir, "src", "pages");
const fixtureIndexPage = path.join(fixturePagesDir, "index.tsx");

let originalCwd = process.cwd();
let originalPort: string | undefined;

describe("E2E Integration", () => {
    let server: any;

    beforeAll(async () => {
        originalPort = process.env.PORT;
        // Use port 0 so Bun.serve picks a random available port
        process.env.PORT = "0";

        process.chdir(fixtureDir);

        global.CONFIG = { development: true };
        global.HMR_CONTROLLERS = [];
        global.BUNDLER_REBUILDS = 0;
        global.PAGE_FILES = [];

        // Set up router pointing at the fixture's pages directory
        global.ROUTER = new Bun.FileSystemRouter({
            style: "nextjs",
            dir: fixturePagesDir,
        });

        // Pre-populate the bundler context map so grab-page-component can
        // look up the compiled path. The `path` value only needs to be
        // present for the guard check; SSR does not require the file to exist.
        global.BUNDLER_CTX_MAP = {
            [fixtureIndexPage]: {
                path: ".bunext/public/pages/index.js",
                hash: "index",
                type: "text/javascript",
                entrypoint: fixtureIndexPage,
                local_path: fixtureIndexPage,
                url_path: "/",
                file_name: "index",
            },
        };
    });

    afterAll(async () => {
        if (server) {
            server.stop(true);
        }
        process.chdir(originalCwd);

        // Restore PORT env variable
        if (originalPort !== undefined) {
            process.env.PORT = originalPort;
        } else {
            delete process.env.PORT;
        }

        // Remove any generated .bunext artifacts from the fixture
        const dotBunext = path.join(fixtureDir, ".bunext");
        if (fs.existsSync(dotBunext)) {
            fs.rmSync(dotBunext, { recursive: true, force: true });
        }
    });

    test("boots up the server and correctly routes to index.tsx page", async () => {
        server = await startServer();
        expect(server).toBeDefined();
        expect(server.port).toBeGreaterThan(0);

        const response = await fetch(`http://localhost:${server.port}/`);
        expect(response.status).toBe(200);

        const html = await response.text();
        expect(html).toContain("Hello E2E");
    });

    test("returns 404 for unknown route", async () => {
        const response = await fetch(`http://localhost:${server.port}/unknown-foo-bar123`);
        expect(response.status).toBe(404);
        const text = await response.text();
        // Default 404 component is rendered
        expect(text).toContain("404");
    });

    test("server props injected from .server.ts companion file", async () => {
        const serverFilePath = path.join(fixturePagesDir, "index.server.ts");
        const pageFilePath = fixtureIndexPage;

        // Write a temporary .server.ts companion that injects a prop
        await Bun.write(serverFilePath, `
import type { BunextPageServerFn } from "../../../../../src/types";

const server: BunextPageServerFn<{ greeting: string }> = async () => {
    return { props: { greeting: "Hello from server" } };
};

export default server;
`);

        // Add the fixture page to the BUNDLER_CTX_MAP
        global.BUNDLER_CTX_MAP[pageFilePath] = {
            path: ".bunext/public/pages/index.js",
            hash: "index",
            type: "text/javascript",
            entrypoint: pageFilePath,
            local_path: pageFilePath,
            url_path: "/",
            file_name: "index",
        };

        const response = await fetch(`http://localhost:${server.port}/`);
        expect(response.status).toBe(200);

        const html = await response.text();
        // __PAGE_PROPS__ should include the prop from the server companion
        expect(html).toContain("Hello from server");

        // Clean up
        fs.unlinkSync(serverFilePath);
    });
});
