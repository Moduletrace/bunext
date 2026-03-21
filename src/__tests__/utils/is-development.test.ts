import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import isDevelopment from "../../utils/is-development";

const originalEnv = process.env.NODE_ENV;

beforeEach(() => {
    // Reset global config before each test
    (global as any).CONFIG = {};
});

afterEach(() => {
    process.env.NODE_ENV = originalEnv;
});

describe("isDevelopment", () => {
    it("returns false when NODE_ENV is production", () => {
        process.env.NODE_ENV = "production";
        (global as any).CONFIG = { development: true };
        expect(isDevelopment()).toBe(false);
    });

    it("returns true when config.development is true and NODE_ENV is not production", () => {
        process.env.NODE_ENV = "development";
        (global as any).CONFIG = { development: true };
        expect(isDevelopment()).toBe(true);
    });

    it("returns false when config.development is false", () => {
        process.env.NODE_ENV = "development";
        (global as any).CONFIG = { development: false };
        expect(isDevelopment()).toBe(false);
    });

    it("returns false when config.development is undefined", () => {
        process.env.NODE_ENV = "development";
        (global as any).CONFIG = {};
        expect(isDevelopment()).toBe(false);
    });
});
