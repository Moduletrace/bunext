import { renderToString } from "react-dom/server";
import grabContants from "../../../utils/grab-constants";
import EJSON from "../../../utils/ejson";
import type { LivePageDistGenParams } from "../../../types";
import isDevelopment from "../../../utils/is-development";
import grabWebPageHydrationScript from "./grab-web-page-hydration-script";
import grabWebMetaHTML from "./grab-web-meta-html";
import { log } from "../../../utils/log";
import { AppData } from "../../../data/app-data";
import { readFileSync } from "fs";
import path from "path";

let _reactVersion = "19";
try {
    _reactVersion = JSON.parse(
        readFileSync(
            path.join(process.cwd(), "node_modules/react/package.json"),
            "utf-8",
        ),
    ).version;
} catch {}

export default async function genWebHTML({
    component,
    pageProps,
    bundledMap,
    head: Head,
    module,
    meta,
    routeParams,
    debug,
}: LivePageDistGenParams) {
    const { ClientRootElementIDName, ClientWindowPagePropsName } =
        grabContants();

    if (debug) {
        log.info("component", component);
    }

    const componentHTML = renderToString(component);

    if (debug) {
        log.info("componentHTML", componentHTML);
    }

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
        const dev = isDevelopment();
        const devSuffix = dev ? "?dev" : "";
        const importMap = JSON.stringify({
            imports: {
                react: `https://esm.sh/react@${_reactVersion}${devSuffix}`,
                "react-dom": `https://esm.sh/react-dom@${_reactVersion}${devSuffix}`,
                "react-dom/client": `https://esm.sh/react-dom@${_reactVersion}/client${devSuffix}`,
                "react/jsx-runtime": `https://esm.sh/react@${_reactVersion}/jsx-runtime${devSuffix}`,
                "react/jsx-dev-runtime": `https://esm.sh/react@${_reactVersion}/jsx-dev-runtime${devSuffix}`,
            },
        });
        html += `        <script type="importmap">${importMap}</script>\n`;
        html += `        <script src="/${bundledMap.path}" type="module" id="${AppData["BunextClientHydrationScriptID"]}" async></script>\n`;
    }

    if (isDevelopment()) {
        html += `<script defer>\n${await grabWebPageHydrationScript()}\n</script>\n`;
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
