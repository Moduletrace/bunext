import path from "path";
import grabContants from "../../../utils/grab-constants";
import grabDirNames from "../../../utils/grab-dir-names";
import EJSON from "../../../utils/ejson";
import type { LivePageDistGenParams } from "../../../types";
import isDevelopment from "../../../utils/is-development";

export default async function genWebHTML({
    component,
    pageProps,
    pageName,
    module,
}: LivePageDistGenParams) {
    const { ClientRootElementIDName, ClientWindowPagePropsName } =
        await grabContants();

    const { renderToString } = await import(
        path.join(process.cwd(), "node_modules", "react-dom", "server")
    );

    const componentHTML = renderToString(component);

    const SCRIPT_SRC = path.join("/public/pages", pageName + ".js");
    const CSS_SRC = path.join("/public/pages", pageName + ".css");
    const { HYDRATION_DST_DIR } = grabDirNames();
    const cssExists = await Bun.file(
        path.join(HYDRATION_DST_DIR, pageName + ".css"),
    ).exists();

    let html = `<!DOCTYPE html>\n`;
    html += `<html>\n`;
    html += `    <head>\n`;
    html += `        <meta charset="utf-8" />\n`;
    if (cssExists) {
        html += `        <link rel="stylesheet" href="${CSS_SRC}" />\n`;
    }
    // if (isDevelopment()) {
    //     html += `<script>
    //         const hmr = new EventSource("/__hmr");
    //         hmr.addEventListener("update", (event) => {
    //             if (event.data === "reload") {
    //                 window.location.reload();
    //             }
    //         });
    //     </script>\n`;
    // }
    html += `    </head>\n`;
    html += `    <body>\n`;
    html += `        <div id="${ClientRootElementIDName}">${componentHTML}</div>\n`;
    html += `        <script>window.${ClientWindowPagePropsName} = ${
        EJSON.stringify(pageProps || {}) || "{}"
    }</script>\n`;
    html += `        <script src="${SCRIPT_SRC}" type="module"></script>\n`;

    html += `    </body>\n`;
    html += `</html>\n`;

    return html;
}
