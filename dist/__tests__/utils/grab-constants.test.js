import { describe, it, expect, beforeEach } from "bun:test";
import grabConstants from "../../utils/grab-constants";
beforeEach(() => {
    global.CONFIG = {};
});
describe("grabConstants", () => {
    it("has the correct ClientRootElementIDName", () => {
        expect(grabConstants().ClientRootElementIDName).toBe("__bunext");
    });
    it("has the correct ClientWindowPagePropsName", () => {
        expect(grabConstants().ClientWindowPagePropsName).toBe("__PAGE_PROPS__");
    });
    it("has the correct ClientRootComponentWindowName", () => {
        expect(grabConstants().ClientRootComponentWindowName).toBe("BUNEXT_ROOT");
    });
    it("calculates MBInBytes as 1024 * 1024", () => {
        expect(grabConstants().MBInBytes).toBe(1024 * 1024);
    });
    it("ServerDefaultRequestBodyLimitBytes is 10 MB", () => {
        expect(grabConstants().ServerDefaultRequestBodyLimitBytes).toBe(10 * 1024 * 1024);
    });
    it("MaxBundlerRebuilds is 5", () => {
        expect(grabConstants().MaxBundlerRebuilds).toBe(5);
    });
    it("returns the current global.CONFIG", () => {
        const cfg = { port: 9000 };
        global.CONFIG = cfg;
        expect(grabConstants().config).toBe(cfg);
    });
});
