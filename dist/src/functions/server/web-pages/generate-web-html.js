import path from "path";
import { renderToString } from "react-dom/server";
import grabContants from "../../../utils/grab-constants";
import EJSON from "../../../utils/ejson";
import isDevelopment from "../../../utils/is-development";
export default async function genWebHTML({ component, pageProps, pageName, module, }) {
    const { ClientRootElementIDName, ClientWindowPagePropsName } = await grabContants();
    const componentHTML = renderToString(component);
    const SCRIPT_SRC = path.join("/public/pages", pageName + ".js");
    let html = `<!DOCTYPE html>\n`;
    html += `<html>\n`;
    html += `    <head>\n`;
    html += `        <meta charset="utf-8" />\n`;
    if (isDevelopment()) {
        html += `<script>
            const hmr = new EventSource("/__hmr");
            hmr.addEventListener("update", (event) => {
                if (event.data === "reload") {
                    window.location.reload();
                }
            });
        </script>\n`;
    }
    html += `    </head>\n`;
    html += `    <body>\n`;
    html += `        <div id="${ClientRootElementIDName}">${componentHTML}</div>\n`;
    html += `        <script>window.${ClientWindowPagePropsName} = ${EJSON.stringify(pageProps || {}) || "{}"}</script>\n`;
    html += `        <script src="${SCRIPT_SRC}" type="module"></script>\n`;
    html += `    </body>\n`;
    html += `</html>\n`;
    return html;
}
