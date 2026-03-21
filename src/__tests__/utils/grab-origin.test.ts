import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import grabOrigin from "../../utils/grab-origin";

const originalPort = process.env.PORT;

beforeEach(() => {
    delete process.env.PORT;
    (global as any).CONFIG = {};
});

afterEach(() => {
    if (originalPort !== undefined) {
        process.env.PORT = originalPort;
    } else {
        delete process.env.PORT;
    }
});

describe("grabOrigin", () => {
    it("returns config.origin when set", () => {
        (global as any).CONFIG = { origin: "https://example.com" };
        expect(grabOrigin()).toBe("https://example.com");
    });

    it("falls back to http://localhost:<port> using default port", () => {
        expect(grabOrigin()).toBe("http://localhost:7000");
    });

    it("falls back using PORT env variable", () => {
        process.env.PORT = "8080";
        expect(grabOrigin()).toBe("http://localhost:8080");
    });

    it("falls back using config.port", () => {
        (global as any).CONFIG = { port: 3700 };
        expect(grabOrigin()).toBe("http://localhost:3700");
    });
});
