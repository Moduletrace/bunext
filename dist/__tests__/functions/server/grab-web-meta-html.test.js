import { describe, it, expect } from "bun:test";
import grabWebMetaHTML from "../../../functions/server/web-pages/grab-web-meta-html";
describe("grabWebMetaHTML", () => {
    it("returns empty string for empty meta object", () => {
        expect(grabWebMetaHTML({ meta: {} })).toBe("");
    });
    it("generates a title tag", () => {
        const html = grabWebMetaHTML({ meta: { title: "My Page" } });
        expect(html).toContain("<title>My Page</title>");
    });
    it("generates a description meta tag", () => {
        const html = grabWebMetaHTML({ meta: { description: "A description" } });
        expect(html).toContain('<meta name="description" content="A description"');
    });
    it("joins array keywords with comma", () => {
        const html = grabWebMetaHTML({
            meta: { keywords: ["react", "bun", "ssr"] },
        });
        expect(html).toContain('content="react, bun, ssr"');
    });
    it("uses string keywords directly", () => {
        const html = grabWebMetaHTML({ meta: { keywords: "react, bun" } });
        expect(html).toContain('content="react, bun"');
    });
    it("generates author meta tag", () => {
        const html = grabWebMetaHTML({ meta: { author: "Alice" } });
        expect(html).toContain('<meta name="author" content="Alice"');
    });
    it("generates robots meta tag", () => {
        const html = grabWebMetaHTML({ meta: { robots: "noindex" } });
        expect(html).toContain('<meta name="robots" content="noindex"');
    });
    it("generates canonical link tag", () => {
        const html = grabWebMetaHTML({
            meta: { canonical: "https://example.com/page" },
        });
        expect(html).toContain('<link rel="canonical" href="https://example.com/page"');
    });
    it("generates theme-color meta tag", () => {
        const html = grabWebMetaHTML({ meta: { themeColor: "#ff0000" } });
        expect(html).toContain('<meta name="theme-color" content="#ff0000"');
    });
    it("generates OG tags", () => {
        const html = grabWebMetaHTML({
            meta: {
                og: {
                    title: "OG Title",
                    description: "OG Desc",
                    image: "https://example.com/img.png",
                    url: "https://example.com",
                    type: "website",
                    siteName: "Example",
                    locale: "en_US",
                },
            },
        });
        expect(html).toContain('<meta property="og:title" content="OG Title"');
        expect(html).toContain('<meta property="og:description" content="OG Desc"');
        expect(html).toContain('<meta property="og:image" content="https://example.com/img.png"');
        expect(html).toContain('<meta property="og:url" content="https://example.com"');
        expect(html).toContain('<meta property="og:type" content="website"');
        expect(html).toContain('<meta property="og:site_name" content="Example"');
        expect(html).toContain('<meta property="og:locale" content="en_US"');
    });
    it("generates Twitter card tags", () => {
        const html = grabWebMetaHTML({
            meta: {
                twitter: {
                    card: "summary_large_image",
                    title: "Tweet Title",
                    description: "Tweet Desc",
                    image: "https://example.com/tw.png",
                    site: "@example",
                    creator: "@alice",
                },
            },
        });
        expect(html).toContain('<meta name="twitter:card" content="summary_large_image"');
        expect(html).toContain('<meta name="twitter:title" content="Tweet Title"');
        expect(html).toContain('<meta name="twitter:description" content="Tweet Desc"');
        expect(html).toContain('<meta name="twitter:image" content="https://example.com/tw.png"');
        expect(html).toContain('<meta name="twitter:site" content="@example"');
        expect(html).toContain('<meta name="twitter:creator" content="@alice"');
    });
    it("skips undefined OG fields", () => {
        const html = grabWebMetaHTML({ meta: { og: { title: "Only Title" } } });
        expect(html).toContain("og:title");
        expect(html).not.toContain("og:description");
        expect(html).not.toContain("og:image");
    });
    it("does not emit tags for missing fields", () => {
        const html = grabWebMetaHTML({ meta: { title: "Hello" } });
        expect(html).not.toContain("description");
        expect(html).not.toContain("og:");
        expect(html).not.toContain("twitter:");
    });
});
