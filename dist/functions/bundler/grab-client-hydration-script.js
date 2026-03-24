import { existsSync } from "fs";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import AppNames from "../../utils/grab-app-names";
import grabConstants from "../../utils/grab-constants";
import pagePathTransform from "../../utils/page-path-transform";
import grabRootFilePath from "../server/web-pages/grab-root-file-path";
const { PAGES_DIR } = grabDirNames();
export default async function grabClientHydrationScript({ page_local_path, }) {
    const { ClientRootElementIDName, ClientRootComponentWindowName, ClientWindowPagePropsName, } = grabConstants();
    const { root_file_path } = grabRootFilePath();
    // const target_path = pagePathTransform({ page_path: page_local_path });
    // const target_root_path = root_file_path
    //     ? pagePathTransform({ page_path: root_file_path })
    //     : undefined;
    if (!existsSync(page_local_path)) {
        return undefined;
    }
    if (root_file_path) {
        if (!existsSync(root_file_path)) {
            return undefined;
        }
        const root_content = await Bun.file(root_file_path).text();
        if (!root_content.match(/^export default/m)) {
            return undefined;
        }
    }
    const page_content = await Bun.file(page_local_path).text();
    if (!page_content.match(/^export default/m)) {
        return undefined;
    }
    let txt = ``;
    txt += `import { hydrateRoot } from "react-dom/client";\n`;
    if (root_file_path) {
        txt += `import Root from "${root_file_path}";\n`;
    }
    txt += `import Page from "${page_local_path}";\n\n`;
    txt += `const pageProps = window.${ClientWindowPagePropsName} || {};\n`;
    if (root_file_path) {
        txt += `const component = <Root {...pageProps}><Page {...pageProps} /></Root>\n`;
    }
    else {
        txt += `const component = <Page {...pageProps} />\n`;
    }
    txt += `if (window.${ClientRootComponentWindowName}?.render) {\n`;
    txt += `    window.${ClientRootComponentWindowName}.render(component);\n`;
    txt += `} else {\n`;
    txt += `    const root = hydrateRoot(document.getElementById("${ClientRootElementIDName}"), component, { onRecoverableError: () => {\n\n`;
    txt += `        console.log(\`Hydration Error.\`)\n\n`;
    txt += `    } });\n\n`;
    txt += `    window.${ClientRootComponentWindowName} = root;\n`;
    txt += `    window.__BUNEXT_RERENDER__ = (NewPage) => {\n`;
    txt += `        const props = window.${ClientWindowPagePropsName} || {};\n`;
    txt += `        root.render(<NewPage {...props} />);\n`;
    txt += `    };\n`;
    txt += `}\n`;
    return txt;
}
