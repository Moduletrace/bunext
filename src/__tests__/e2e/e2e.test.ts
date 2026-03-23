import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import startServer from "../../../src/functions/server/start-server";
import rewritePagesModule from "../../../src/utils/rewrite-pages-module";
import pagePathTransform from "../../../src/utils/page-path-transform";
import path from "path";
import fs from "fs";

// Fixture lives under test/ so the framework's directory guard allows it
const fixtureDir = path.resolve(__dirname, "../../../test/e2e-fixture");
const fixturePagesDir = path.join(fixtureDir, "src", "pages");
const fixtureIndexPage = path.join(fixturePagesDir, "index.tsx");

// The rewritten page path (inside .bunext/pages, stripped of server logic)
const rewrittenIndexPage = pagePathTransform({ page_path: fixtureIndexPage });

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

        // Rewrite the fixture page (strips server logic) into .bunext/pages
        // so that grab-page-react-component-string can resolve the import
        await rewritePagesModule({ page_file_path: fixtureIndexPage });

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

        // Remove the rewritten page created during setup
        const rewrittenDir = path.dirname(rewrittenIndexPage);
        if (fs.existsSync(rewrittenDir)) {
            fs.rmSync(rewrittenDir, { recursive: true, force: true });
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
});
