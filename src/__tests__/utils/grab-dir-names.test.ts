import { describe, it, expect } from "bun:test";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";

describe("grabDirNames", () => {
    it("derives all paths from process.cwd()", () => {
        const cwd = process.cwd();
        const dirs = grabDirNames();

        expect(dirs.ROOT_DIR).toBe(cwd);
        expect(dirs.SRC_DIR).toBe(path.join(cwd, "src"));
        expect(dirs.PAGES_DIR).toBe(path.join(cwd, "src", "pages"));
        expect(dirs.API_DIR).toBe(path.join(cwd, "src", "pages", "api"));
        expect(dirs.PUBLIC_DIR).toBe(path.join(cwd, "public"));
    });

    it("nests HYDRATION_DST_DIR under public/__bunext/pages", () => {
        const dirs = grabDirNames();
        expect(dirs.HYDRATION_DST_DIR).toBe(
            path.join(dirs.PUBLIC_DIR, "__bunext", "pages"),
        );
    });

    it("nests BUNEXT_CACHE_DIR under public/__bunext/cache", () => {
        const dirs = grabDirNames();
        expect(dirs.BUNEXT_CACHE_DIR).toBe(
            path.join(dirs.PUBLIC_DIR, "__bunext", "cache"),
        );
    });

    it("places map JSON file inside HYDRATION_DST_DIR", () => {
        const dirs = grabDirNames();
        expect(dirs.HYDRATION_DST_DIR_MAP_JSON_FILE).toBe(
            path.join(dirs.HYDRATION_DST_DIR, "map.json"),
        );
    });

    it("places CONFIG_FILE at root", () => {
        const dirs = grabDirNames();
        expect(dirs.CONFIG_FILE).toBe(path.join(dirs.ROOT_DIR, "bunext.config.ts"));
    });

    it("places BUNX_TMP_DIR inside .bunext", () => {
        const dirs = grabDirNames();
        expect(dirs.BUNX_TMP_DIR).toContain(".bunext");
        expect(dirs.BUNX_TMP_DIR).toEndWith(".tmp");
    });

    it("places BUNX_HYDRATION_SRC_DIR under client/hydration-src", () => {
        const dirs = grabDirNames();
        expect(dirs.BUNX_HYDRATION_SRC_DIR).toContain(
            path.join("client", "hydration-src"),
        );
    });

    it("sets 404 file name to not-found", () => {
        const dirs = grabDirNames();
        expect(dirs.BUNX_ROOT_404_FILE_NAME).toBe("not-found");
    });

    it("sets 500 file name to server-error", () => {
        const dirs = grabDirNames();
        expect(dirs.BUNX_ROOT_500_FILE_NAME).toBe("server-error");
    });

    it("preset 404 component path ends with not-found.tsx", () => {
        const dirs = grabDirNames();
        expect(dirs.BUNX_ROOT_404_PRESET_COMPONENT).toEndWith("not-found.tsx");
    });

    it("preset 500 component path ends with server-error.tsx", () => {
        const dirs = grabDirNames();
        expect(dirs.BUNX_ROOT_500_PRESET_COMPONENT).toEndWith("server-error.tsx");
    });
});
