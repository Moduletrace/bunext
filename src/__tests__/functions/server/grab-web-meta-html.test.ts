import { describe, it, expect } from "bun:test";
import { renderToString } from "react-dom/server";
import grabWebMetaHTML from "../../../functions/server/web-pages/grab-web-meta-html";

function render(meta: Parameters<typeof grabWebMetaHTML>[0]["meta"]) {
    return renderToString(grabWebMetaHTML({ meta }));
}

describe("grabWebMetaHTML", () => {
    it("returns empty string for empty meta object", () => {
        expect(render({})).toBe("");
    });

    it("generates a title tag", () => {
        expect(render({ title: "My Page" })).toContain("<title>My Page</title>");
    });

    it("generates a description meta tag", () => {
        expect(render({ description: "A description" })).toContain(
            'content="A description"',
        );
    });

    it("joins array keywords with comma", () => {
        expect(render({ keywords: ["react", "bun", "ssr"] })).toContain(
            'content="react, bun, ssr"',
        );
    });

    it("uses string keywords directly", () => {
        expect(render({ keywords: "react, bun" })).toContain(
            'content="react, bun"',
        );
    });

    it("generates author meta tag", () => {
        expect(render({ author: "Alice" })).toContain('content="Alice"');
    });

    it("generates robots meta tag", () => {
        expect(render({ robots: "noindex" })).toContain('content="noindex"');
    });

    it("generates canonical link tag", () => {
        expect(render({ canonical: "https://example.com/page" })).toContain(
            'href="https://example.com/page"',
        );
    });

    it("generates theme-color meta tag", () => {
        expect(render({ themeColor: "#ff0000" })).toContain(
            'content="#ff0000"',
        );
    });

    it("generates OG tags", () => {
        const html = render({
            og: {
                title: "OG Title",
                description: "OG Desc",
                image: "https://example.com/img.png",
                url: "https://example.com",
                type: "website",
                siteName: "Example",
                locale: "en_US",
            },
        });
        expect(html).toContain('property="og:title"');
        expect(html).toContain('content="OG Title"');
        expect(html).toContain('property="og:description"');
        expect(html).toContain('property="og:image"');
        expect(html).toContain('property="og:url"');
        expect(html).toContain('property="og:type"');
        expect(html).toContain('property="og:site_name"');
        expect(html).toContain('property="og:locale"');
    });

    it("generates Twitter card tags", () => {
        const html = render({
            twitter: {
                card: "summary_large_image",
                title: "Tweet Title",
                description: "Tweet Desc",
                image: "https://example.com/tw.png",
                site: "@example",
                creator: "@alice",
            },
        });
        expect(html).toContain('name="twitter:card"');
        expect(html).toContain('content="summary_large_image"');
        expect(html).toContain('name="twitter:title"');
        expect(html).toContain('name="twitter:description"');
        expect(html).toContain('name="twitter:image"');
        expect(html).toContain('name="twitter:site"');
        expect(html).toContain('name="twitter:creator"');
    });

    it("skips undefined OG fields", () => {
        const html = render({ og: { title: "Only Title" } });
        expect(html).toContain("og:title");
        expect(html).not.toContain("og:description");
        expect(html).not.toContain("og:image");
    });

    it("does not emit tags for missing fields", () => {
        const html = render({ title: "Hello" });
        expect(html).not.toContain("description");
        expect(html).not.toContain("og:");
        expect(html).not.toContain("twitter:");
    });
});
