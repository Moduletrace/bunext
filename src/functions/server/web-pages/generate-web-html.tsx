import path from "path";
import grabContants from "../../../utils/grab-constants";
import grabDirNames from "../../../utils/grab-dir-names";
import EJSON from "../../../utils/ejson";
import type { LivePageDistGenParams } from "../../../types";
import isDevelopment from "../../../utils/is-development";
import grabWebPageHydrationScript from "./grab-web-page-hydration-script";

export default async function genWebHTML({
    component,
    pageProps,
    bundledMap,
}: LivePageDistGenParams) {
    const { ClientRootElementIDName, ClientWindowPagePropsName } =
        await grabContants();

    const { renderToString } = await import(
        path.join(process.cwd(), "node_modules", "react-dom", "server")
    );

    const componentHTML = renderToString(component);

    // const SCRIPT_SRC = path.join("/public/pages", bundledMap.path);
    // const CSS_SRC = bundledMap.css_path
    //     ? path.join("/public/pages", bundledMap.css_path)
    //     : undefined;
    // const { HYDRATION_DST_DIR } = grabDirNames();

    let html = `<!DOCTYPE html>\n`;
    html += `<html>\n`;
    html += `    <head>\n`;
    html += `        <meta charset="utf-8" />\n`;
    if (bundledMap.css_path) {
        html += `        <link rel="stylesheet" href="/${bundledMap.css_path}" />\n`;
    }
    html += `        <script>window.${ClientWindowPagePropsName} = ${
        EJSON.stringify(pageProps || {}) || "{}"
    }</script>\n`;
    html += `        <script src="/${bundledMap.path}" type="module" defer></script>\n`;

    if (isDevelopment()) {
        html += `<script defer>\n${await grabWebPageHydrationScript({ bundledMap })}\n</script>\n`;
    }

    html += `    </head>\n`;
    html += `    <body>\n`;
    html += `        <div id="${ClientRootElementIDName}">${componentHTML}</div>\n`;
    html += `    </body>\n`;
    html += `</html>\n`;

    return html;
}
