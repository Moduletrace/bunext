import { existsSync } from "fs";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import AppNames from "../../utils/grab-app-names";
import grabConstants from "../../utils/grab-constants";
const { PAGES_DIR } = grabDirNames();
export default function grabClientHydrationScript({ page_local_path }) {
    const { ClientRootElementIDName, ClientRootComponentWindowName } = grabConstants();
    const root_component_path = path.join(PAGES_DIR, `${AppNames["RootPagesComponentName"]}.tsx`);
    const does_root_exist = existsSync(root_component_path);
    // let txt = ``;
    // txt += `import { hydrateRoot } from "react-dom/client";\n`;
    // if (does_root_exist) {
    //     txt += `import Root from "${root_component_path}";\n`;
    // }
    // txt += `import Page from "${page.local_path}";\n\n`;
    // txt += `const pageProps = window.__PAGE_PROPS__ || {};\n`;
    // if (does_root_exist) {
    //     txt += `const component = <Root {...pageProps}><Page {...pageProps} /></Root>\n`;
    // } else {
    //     txt += `const component = <Page {...pageProps} />\n`;
    // }
    // txt += `const root = hydrateRoot(document.getElementById("${ClientRootElementIDName}"), component);\n\n`;
    // txt += `window.${ClientRootComponentWindowName} = root;\n`;
    let txt = ``;
    // txt += `import * as React from "react";\n`;
    // txt += `import * as ReactDOM from "react-dom";\n`;
    // txt += `import * as ReactDOMClient from "react-dom/client";\n`;
    // txt += `import * as JSXRuntime from "react/jsx-runtime";\n`;
    txt += `import { hydrateRoot, createElement } from "react-dom/client";\n`;
    if (does_root_exist) {
        txt += `import Root from "${root_component_path}";\n`;
    }
    txt += `import Page from "${page_local_path}";\n\n`;
    // txt += `window.__REACT__ = React;\n`;
    // txt += `window.__REACT_DOM__ = ReactDOM;\n`;
    // txt += `window.__REACT_DOM_CLIENT__ = ReactDOMClient;\n`;
    // txt += `window.__JSX_RUNTIME__ = JSXRuntime;\n\n`;
    txt += `const pageProps = window.__PAGE_PROPS__ || {};\n`;
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
    txt += `        const props = window.__PAGE_PROPS__ || {};\n`;
    txt += `        root.render(<NewPage {...props} />);\n`;
    txt += `    };\n`;
    txt += `}\n`;
    // // HMR re-render helper
    // if (does_root_exist) {
    //     txt += `window.__BUNEXT_RERENDER__ = (NewPage) => {\n`;
    //     txt += `    const props = window.__PAGE_PROPS__ || {};\n`;
    //     txt += `    root.render(<Root {...props}><NewPage {...props} /></Root>);\n`;
    //     txt += `};\n`;
    // } else {
    // }
    return txt;
}
