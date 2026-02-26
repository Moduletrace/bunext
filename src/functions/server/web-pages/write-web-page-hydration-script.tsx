import { writeFileSync } from "fs";
import path from "path";
import grabDirNames from "../../../utils/grab-dir-names";
import grabContants from "../../../utils/grab-constants";
import genWebHTML from "./generate-web-html";
import type { PageDistGenParams } from "../../../types";

const { BUNX_HYDRATION_SRC_DIR, HYDRATION_DST_DIR } = grabDirNames();

export default async function (params: PageDistGenParams) {
    const { ClientRootElementIDName, ClientWindowPagePropsName } =
        await grabContants();

    const PAGE_DIST_DIR = path.join(HYDRATION_DST_DIR, params.pageName);

    const pageSrcTs = `index.tsx`;

    let script = "";

    script += `import React from "react";\n`;
    script += `import { hydrateRoot } from "react-dom/client";\n`;
    script += `import App from "./";\n`;

    script += `declare global {\n`;
    script += `    interface Window {\n`;
    script += `        ${ClientWindowPagePropsName}: any;\n`;
    script += `    }\n`;
    script += `}\n`;

    script += `const container = document.getElementById("${ClientRootElementIDName}");\n`;
    script += `hydrateRoot(container, <App {...window.${ClientWindowPagePropsName}} />);\n`;

    const SRC_WRITE_FILE = path.join(PAGE_DIST_DIR, pageSrcTs);
    writeFileSync(SRC_WRITE_FILE, script, "utf-8");

    let html = await genWebHTML(params);
    const pageHtml = `index.html`;

    const HTML_WRITE_FILE = path.join(PAGE_DIST_DIR, pageHtml);
    writeFileSync(HTML_WRITE_FILE, html, "utf-8");
}
