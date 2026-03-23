import { escape } from "lodash";
export default function grabWebMetaHTML({ meta }) {
    let html = ``;
    if (meta.title) {
        html += `        <title>${escape(meta.title)}</title>\n`;
    }
    if (meta.description) {
        html += `        <meta name="description" content="${escape(meta.description)}" />\n`;
    }
    if (meta.keywords) {
        const keywords = Array.isArray(meta.keywords)
            ? meta.keywords.join(", ")
            : meta.keywords;
        html += `        <meta name="keywords" content="${escape(keywords)}" />\n`;
    }
    if (meta.author) {
        html += `        <meta name="author" content="${escape(meta.author)}" />\n`;
    }
    if (meta.robots) {
        html += `        <meta name="robots" content="${escape(meta.robots)}" />\n`;
    }
    if (meta.canonical) {
        html += `        <link rel="canonical" href="${escape(meta.canonical)}" />\n`;
    }
    if (meta.themeColor) {
        html += `        <meta name="theme-color" content="${escape(meta.themeColor)}" />\n`;
    }
    if (meta.og) {
        const { og } = meta;
        if (og.title)
            html += `        <meta property="og:title" content="${escape(og.title)}" />\n`;
        if (og.description)
            html += `        <meta property="og:description" content="${escape(og.description)}" />\n`;
        if (og.image)
            html += `        <meta property="og:image" content="${escape(og.image)}" />\n`;
        if (og.url)
            html += `        <meta property="og:url" content="${escape(og.url)}" />\n`;
        if (og.type)
            html += `        <meta property="og:type" content="${escape(og.type)}" />\n`;
        if (og.siteName)
            html += `        <meta property="og:site_name" content="${escape(og.siteName)}" />\n`;
        if (og.locale)
            html += `        <meta property="og:locale" content="${escape(og.locale)}" />\n`;
    }
    if (meta.twitter) {
        const { twitter } = meta;
        if (twitter.card)
            html += `        <meta name="twitter:card" content="${escape(twitter.card)}" />\n`;
        if (twitter.title)
            html += `        <meta name="twitter:title" content="${escape(twitter.title)}" />\n`;
        if (twitter.description)
            html += `        <meta name="twitter:description" content="${escape(twitter.description)}" />\n`;
        if (twitter.image)
            html += `        <meta name="twitter:image" content="${escape(twitter.image)}" />\n`;
        if (twitter.site)
            html += `        <meta name="twitter:site" content="${escape(twitter.site)}" />\n`;
        if (twitter.creator)
            html += `        <meta name="twitter:creator" content="${escape(twitter.creator)}" />\n`;
    }
    return html;
}
