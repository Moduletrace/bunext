import { existsSync } from "fs";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import AppNames from "../../utils/grab-app-names";
import grabConstants from "../../utils/grab-constants";
import pagePathTransform from "../../utils/page-path-transform";
const { PAGES_DIR } = grabDirNames();
export default async function grabClientHydrationScript({ page_local_path, }) {
    const { ClientRootElementIDName, ClientRootComponentWindowName, ClientWindowPagePropsName, } = grabConstants();
    const target_path = pagePathTransform({ page_path: page_local_path });
    const root_component_path = path.join(PAGES_DIR, `${AppNames["RootPagesComponentName"]}.tsx`);
    const does_root_exist = existsSync(root_component_path);
    let txt = ``;
    txt += `import { hydrateRoot } from "react-dom/client";\n`;
    if (does_root_exist) {
        txt += `import Root from "${root_component_path}";\n`;
    }
    txt += `import Page from "${target_path}";\n\n`;
    txt += `const pageProps = window.${ClientWindowPagePropsName} || {};\n`;
    if (does_root_exist) {
        txt += `const component = <Root suppressHydrationWarning={true} {...pageProps}><Page {...pageProps} /></Root>\n`;
    }
    else {
        txt += `const component = <Page suppressHydrationWarning={true} {...pageProps} />\n`;
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
