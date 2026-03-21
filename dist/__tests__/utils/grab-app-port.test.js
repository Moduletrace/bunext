import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import grabAppPort from "../../utils/grab-app-port";
const originalEnv = process.env.PORT;
beforeEach(() => {
    delete process.env.PORT;
    global.CONFIG = {};
});
afterEach(() => {
    if (originalEnv !== undefined) {
        process.env.PORT = originalEnv;
    }
    else {
        delete process.env.PORT;
    }
});
describe("grabAppPort", () => {
    it("returns the default port (7000) when no config or env set", () => {
        expect(grabAppPort()).toBe(7000);
    });
    it("uses PORT env variable when set", () => {
        process.env.PORT = "8080";
        expect(grabAppPort()).toBe(8080);
    });
    it("uses config.port when PORT env is not set", () => {
        global.CONFIG = { port: 3000 };
        expect(grabAppPort()).toBe(3000);
    });
    it("PORT env takes precedence over config.port", () => {
        process.env.PORT = "9000";
        global.CONFIG = { port: 3000 };
        expect(grabAppPort()).toBe(9000);
    });
    it("handles non-numeric PORT env gracefully via numberfy", () => {
        process.env.PORT = "abc";
        // numberfy strips non-numeric chars, "abc" → "" → 0
        expect(grabAppPort()).toBe(0);
    });
});
