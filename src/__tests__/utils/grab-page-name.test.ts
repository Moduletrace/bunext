import { describe, it, expect } from "bun:test";
import grabPageName from "../../utils/grab-page-name";

describe("grabPageName", () => {
    it("returns the page name for a simple page path", () => {
        expect(grabPageName({ path: "/home/user/project/src/pages/about.tsx" }))
            .toBe("about");
    });

    it("returns 'index' for a root index file (no -index stripping at root)", () => {
        // -index suffix is only stripped when joined: e.g. "blog-index" → "blog"
        // A standalone "index" filename has no leading dash so stays as-is
        expect(grabPageName({ path: "/home/user/project/src/pages/index.tsx" }))
            .toBe("index");
    });

    it("handles nested page paths", () => {
        expect(
            grabPageName({ path: "/home/user/project/src/pages/blog/post.tsx" }),
        ).toBe("blog-post");
    });

    it("strips -index suffix from nested index files", () => {
        expect(
            grabPageName({ path: "/home/user/project/src/pages/blog/index.tsx" }),
        ).toBe("blog");
    });

    it("converts dynamic segments [slug] by replacing brackets", () => {
        const result = grabPageName({
            path: "/home/user/project/src/pages/blog/[slug].tsx",
        });
        // [ → - and ] is dropped (not a-z or -), so [slug] → -slug
        expect(result).toBe("blog--slug");
    });

    it("converts spread [...params] segments", () => {
        const result = grabPageName({
            path: "/home/user/project/src/pages/[...params].tsx",
        });
        // "[...params]" → remove ext → "[...params]"
        // [ → "-" → "-...params]"
        // "..." → "-" → "--params]"
        // strip non [a-z-] → "--params"
        expect(result).toBe("--params");
    });

    it("strips uppercase letters (only a-z and - are kept)", () => {
        // [^a-z\-] strips uppercase — 'A' is removed, 'bout' remains
        expect(
            grabPageName({ path: "/home/user/project/src/pages/About.tsx" }),
        ).toBe("bout");
    });

    it("handles deeply nested paths", () => {
        expect(
            grabPageName({
                path: "/home/user/project/src/pages/admin/users/list.tsx",
            }),
        ).toBe("admin-users-list");
    });
});
