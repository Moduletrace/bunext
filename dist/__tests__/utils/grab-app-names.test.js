import { describe, it, expect } from "bun:test";
import AppNames from "../../utils/grab-app-names";
describe("AppNames", () => {
    it("has a defaultPort of 7000", () => {
        expect(AppNames.defaultPort).toBe(7000);
    });
    it("has the correct defaultAssetPrefix", () => {
        expect(AppNames.defaultAssetPrefix).toBe("_bunext/static");
    });
    it("has name Bunext", () => {
        expect(AppNames.name).toBe("Bunext");
    });
    it("has a version string", () => {
        expect(typeof AppNames.version).toBe("string");
        expect(AppNames.version.length).toBeGreaterThan(0);
    });
    it("has defaultDistDir as .bunext", () => {
        expect(AppNames.defaultDistDir).toBe(".bunext");
    });
    it("has RootPagesComponentName as __root", () => {
        expect(AppNames.RootPagesComponentName).toBe("__root");
    });
});
