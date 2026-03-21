import { describe, expect, test, mock, afterEach } from "bun:test";
import startServer from "../../../../src/functions/server/start-server";
import { log } from "../../../../src/utils/log";

// Mock log so we don't spam terminal during tests
mock.module("../../../../src/utils/log", () => ({
    log: {
        server: mock((msg: string) => {}),
        info: mock((msg: string) => {}),
        error: mock((msg: string) => {}),
    }
}));

// Mock grabConfig so it doesn't try to look for bunext.config.ts and exit process
mock.module("../../../../src/functions/grab-config", () => ({
    default: async () => ({})
}));

// Mock grabAppPort to return 0 so Bun.serve picks a random port
mock.module("../../../../src/utils/grab-app-port", () => ({
    default: () => 0
}));

describe("startServer", () => {
    afterEach(() => {
        if (global.SERVER) {
            global.SERVER.stop(true);
            global.SERVER = undefined;
        }
    });

    test("starts the server and assigns to global.SERVER", async () => {
        global.CONFIG = { development: true };
        
        const server = await startServer();
        
        expect(server).toBeDefined();
        expect(server.port).toBeGreaterThan(0);
        expect(global.SERVER).toBe(server);
        expect(log.server).toHaveBeenCalled();
        
        server.stop(true);
    });
});
