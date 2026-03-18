export default function grabWebMetaHTML({ meta }) {
    let html = ``;
    if (meta.title) {
        html += `        <title>${meta.title}</title>\n`;
    }
    if (meta.description) {
        html += `        <meta name="description" content="${meta.description}" />\n`;
    }
    if (meta.keywords) {
        const keywords = Array.isArray(meta.keywords)
            ? meta.keywords.join(", ")
            : meta.keywords;
        html += `        <meta name="keywords" content="${keywords}" />\n`;
    }
    if (meta.author) {
        html += `        <meta name="author" content="${meta.author}" />\n`;
    }
    if (meta.robots) {
        html += `        <meta name="robots" content="${meta.robots}" />\n`;
    }
    if (meta.canonical) {
        html += `        <link rel="canonical" href="${meta.canonical}" />\n`;
    }
    if (meta.themeColor) {
        html += `        <meta name="theme-color" content="${meta.themeColor}" />\n`;
    }
    if (meta.og) {
        const { og } = meta;
        if (og.title)
            html += `        <meta property="og:title" content="${og.title}" />\n`;
        if (og.description)
            html += `        <meta property="og:description" content="${og.description}" />\n`;
        if (og.image)
            html += `        <meta property="og:image" content="${og.image}" />\n`;
        if (og.url)
            html += `        <meta property="og:url" content="${og.url}" />\n`;
        if (og.type)
            html += `        <meta property="og:type" content="${og.type}" />\n`;
        if (og.siteName)
            html += `        <meta property="og:site_name" content="${og.siteName}" />\n`;
        if (og.locale)
            html += `        <meta property="og:locale" content="${og.locale}" />\n`;
    }
    if (meta.twitter) {
        const { twitter } = meta;
        if (twitter.card)
            html += `        <meta name="twitter:card" content="${twitter.card}" />\n`;
        if (twitter.title)
            html += `        <meta name="twitter:title" content="${twitter.title}" />\n`;
        if (twitter.description)
            html += `        <meta name="twitter:description" content="${twitter.description}" />\n`;
        if (twitter.image)
            html += `        <meta name="twitter:image" content="${twitter.image}" />\n`;
        if (twitter.site)
            html += `        <meta name="twitter:site" content="${twitter.site}" />\n`;
        if (twitter.creator)
            html += `        <meta name="twitter:creator" content="${twitter.creator}" />\n`;
    }
    return html;
}
