import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import startServer from "../../../src/functions/server/start-server";
import bunextInit from "../../../src/functions/bunext-init";
import path from "path";
import fs from "fs";
let originalCwd = process.cwd();
describe("E2E Integration", () => {
    let server;
    beforeAll(async () => {
        // Change to the fixture directory to simulate actual user repo
        const fixtureDir = path.resolve(__dirname, "../__fixtures__/app");
        process.chdir(fixtureDir);
        // Mock grabAppPort to assign dynamically to avoid port conflicts
        global.CONFIG = { development: true };
    });
    afterAll(async () => {
        if (server) {
            server.stop(true);
        }
        process.chdir(originalCwd);
        // Ensure to remove the dummy generated .bunext folder
        const dotBunext = path.resolve(__dirname, "../__fixtures__/app/.bunext");
        if (fs.existsSync(dotBunext)) {
            fs.rmSync(dotBunext, { recursive: true, force: true });
        }
        const pubBunext = path.resolve(__dirname, "../__fixtures__/app/public/__bunext");
        if (fs.existsSync(pubBunext)) {
            fs.rmSync(pubBunext, { recursive: true, force: true });
        }
    });
    test("boots up the server and correctly routes to index.tsx page", async () => {
        // Mock to randomize port
        // Note: Bun test runs modules in isolation but startServer imports grab-app-port
        // If we can't easily mock we can set PORT env
        process.env.PORT = "0"; // Let Bun.serve pick port
        await bunextInit();
        server = await startServer();
        expect(server).toBeDefined();
        // Fetch the index page
        const response = await fetch(`http://localhost:${server.port}/`);
        expect(response.status).toBe(200);
        const html = await response.text();
        expect(html).toContain("Hello E2E");
    });
    test("returns 404 for unknown route", async () => {
        const response = await fetch(`http://localhost:${server.port}/unknown-foo-bar123`);
        expect(response.status).toBe(404);
        const text = await response.text();
        // Assume default 404 preset component is rendered
        expect(text).toContain("404");
    });
});
