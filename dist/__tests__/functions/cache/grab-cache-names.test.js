import { describe, it, expect } from "bun:test";
import grabCacheNames from "../../../functions/cache/grab-cache-names";
describe("grabCacheNames", () => {
    it("returns cache_name and cache_meta_name for a simple key", () => {
        const { cache_name, cache_meta_name } = grabCacheNames({ key: "home" });
        expect(cache_name).toBe("home.res.html");
        expect(cache_meta_name).toBe("home.meta.json");
    });
    it("defaults paradigm to html", () => {
        const { cache_name } = grabCacheNames({ key: "page" });
        expect(cache_name).toEndWith(".res.html");
    });
    it("uses json paradigm when specified", () => {
        const { cache_name } = grabCacheNames({ key: "api-data", paradigm: "json" });
        expect(cache_name).toBe("api-data.res.json");
    });
    it("URL-encodes the key", () => {
        const { cache_name, cache_meta_name } = grabCacheNames({
            key: "/blog/hello world",
        });
        const encoded = encodeURIComponent("/blog/hello world");
        expect(cache_name).toBe(`${encoded}.res.html`);
        expect(cache_meta_name).toBe(`${encoded}.meta.json`);
    });
    it("handles keys with special characters", () => {
        const key = "page?id=1&sort=asc";
        const { cache_name } = grabCacheNames({ key });
        expect(cache_name).toBe(`${encodeURIComponent(key)}.res.html`);
    });
    it("cache_meta_name always uses .meta.json regardless of paradigm", () => {
        const { cache_meta_name } = grabCacheNames({
            key: "test",
            paradigm: "json",
        });
        expect(cache_meta_name).toBe("test.meta.json");
    });
});
