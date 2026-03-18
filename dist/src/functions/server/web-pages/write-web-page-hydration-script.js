import { writeFileSync } from "fs";
import path from "path";
import grabDirNames from "../../../utils/grab-dir-names";
import grabContants from "../../../utils/grab-constants";
const { BUNX_HYDRATION_SRC_DIR } = grabDirNames();
export default async function (params) {
    const { pageName, page_file } = params;
    const { ClientRootElementIDName, ClientWindowPagePropsName } = await grabContants();
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
    script += `const container = document.getElementById("${ClientRootElementIDName}");\n`;
    script += `hydrateRoot(container, <App {...window.${ClientWindowPagePropsName}} />);\n`;
    const SRC_WRITE_FILE = path.join(BUNX_HYDRATION_SRC_DIR, pageSrcTsFileName);
    writeFileSync(SRC_WRITE_FILE, script, "utf-8");
}
