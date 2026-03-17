import path from "path";
import grabContants from "../../../utils/grab-constants";
import EJSON from "../../../utils/ejson";
import type { LivePageDistGenParams } from "../../../types";
import isDevelopment from "../../../utils/is-development";
import grabWebPageHydrationScript from "./grab-web-page-hydration-script";
import grabWebMetaHTML from "./grab-web-meta-html";

export default async function genWebHTML({
    component,
    pageProps,
    bundledMap,
    head: Head,
    module,
    meta,
    routeParams,
}: LivePageDistGenParams) {
    const { ClientRootElementIDName, ClientWindowPagePropsName } =
        await grabContants();

    const { renderToString } = await import(
        path.join(process.cwd(), "node_modules", "react-dom", "server")
    );

    const componentHTML = renderToString(component);
    const headHTML = Head
        ? renderToString(<Head serverRes={pageProps} ctx={routeParams} />)
        : "";

    let html = `<!DOCTYPE html>\n`;
    html += `<html>\n`;
    html += `    <head>\n`;
    html += `        <meta charset="utf-8" />\n`;
    html += `        <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;

    if (meta) {
        html += `        ${grabWebMetaHTML({ meta })}\n`;
    }

    if (bundledMap?.css_path) {
        html += `        <link rel="stylesheet" href="/${bundledMap.css_path}" />\n`;
    }

    html += `        <script>window.${ClientWindowPagePropsName} = ${
        EJSON.stringify(pageProps || {}) || "{}"
    }</script>\n`;

    if (bundledMap?.path) {
        html += `        <script src="/${bundledMap.path}" type="module" defer></script>\n`;
    }

    if (isDevelopment()) {
        html += `<script defer>\n${await grabWebPageHydrationScript({ bundledMap })}\n</script>\n`;
    }

    if (headHTML) {
        html += `    ${headHTML}\n`;
    }

    html += `    </head>\n`;
    html += `    <body>\n`;
    html += `        <div id="${ClientRootElementIDName}">${componentHTML}</div>\n`;
    html += `    </body>\n`;
    html += `</html>\n`;

    return html;
}
