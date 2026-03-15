import { writeFileSync } from "fs";
import path from "path";
import grabDirNames from "../../../utils/grab-dir-names";
import grabContants from "../../../utils/grab-constants";
import type { PageDistGenParams } from "../../../types";
import isDevelopment from "../../../utils/is-development";

const { BUNX_HYDRATION_SRC_DIR } = grabDirNames();

export default async function (params: PageDistGenParams) {
    const { pageName, page_file } = params;
    const { ClientRootElementIDName, ClientWindowPagePropsName } =
        await grabContants();

    const pageSrcTsFileName = `${pageName}.tsx`;

    let script = "";

    script += `import React from "react";\n`;
    script += `import { hydrateRoot } from "react-dom/client";\n`;
    script += `import App from "${page_file}";\n`;

    script += `declare global {\n`;
    script += `    interface Window {\n`;
    script += `        ${ClientWindowPagePropsName}: any;\n`;
    script += `    }\n`;
    script += `}\n`;

    script += `let root: any = null;\n\n`;
    script += `const container = document.getElementById("${ClientRootElementIDName}");\n\n`;
    script += `if (container) {\n`;
    script += `    root = hydrateRoot(container, <App {...window.${ClientWindowPagePropsName}} />);\n`;
    script += `}\n\n`;
    if (isDevelopment()) {
        script += `const hmr = new EventSource("/__hmr");\n`;
        script += `hmr.addEventListener("update", (event) => {\n`;
        // script += `    console.log(\`HMR even received:\`, event);\n`;
        script += `    if (event.data && root) {\n`;
        script += `        console.log(\`HMR Changes Detected. Reloading ...\`);\n`;
        // script += `        console.log("root", root);\n`;
        // script += `        root.unmount();\n`;
        // script += `        const container = document.getElementById("${ClientRootElementIDName}");\n\n`;
        // script += `        root = hydrateRoot(container!, <App {...window.${ClientWindowPagePropsName}} />);\n`;
        script += `        root.render(<App {...window.${ClientWindowPagePropsName}} />);\n`;
        // script += `        window.location.reload();\n`;
        script += `    }\n`;
        script += ` });\n`;
    }

    const SRC_WRITE_FILE = path.join(BUNX_HYDRATION_SRC_DIR, pageSrcTsFileName);
    writeFileSync(SRC_WRITE_FILE, script, "utf-8");
}
