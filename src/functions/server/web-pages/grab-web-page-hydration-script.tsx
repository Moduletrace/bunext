import type { BundlerCTXMap } from "../../../types";
import { AppData } from "../../../data/app-data";

type Params = {
    bundledMap?: BundlerCTXMap;
};

export default async function ({ bundledMap }: Params) {
    let script = "";

    script += `console.log(\`Development Environment\`);\n\n`;

    script += `const hmr = new EventSource("/__hmr");\n`;
    script += `hmr.addEventListener("update", async (event) => {\n`;
    script += `    if (event.data) {\n`;
    script += `        console.log(\`HMR Changes Detected. Updating ...\`);\n`;
    script += `        try {\n`;
    script += `            const data = JSON.parse(event.data);\n`;
    script += `            console.log("data", data);\n`;
    // script += `            const modulePath = \`/\${data.target_map.path}\`;\n\n`;

    // script += `            const modulePath = \`/${AppData["ClientHMRPath"]}?href=\${window.location.href}&t=\${Date.now()}\`;\n\n`;
    // script += `            console.log("Fetching updated module ...", modulePath);\n\n`;
    // script += `            const newModule = await import(modulePath);\n\n`;
    // script += `            console.log("newModule", newModule);\n\n`;
    // script += `            if (window.__BUNEXT_RERENDER__ && newModule.default) {\n`;
    // script += `                window.__BUNEXT_RERENDER__(newModule.default);\n`;
    // script += `                console.log(\`HMR: Component updated in-place\`);\n`;
    // script += `            } else {\n`;
    // script += `                console.warn(\`HMR: No re-render helper found, falling back to reload\`);\n`;
    // // script += `                window.location.reload();\n`;
    // script += `            }\n\n`;

    script += `            if (data.target_map.css_path) {\n`;
    script += `                const oldLink = document.querySelector('link[rel="stylesheet"]');\n`;
    script += `                const newLink = document.createElement("link");\n`;
    script += `                newLink.rel = "stylesheet";\n`;
    script += `                newLink.href = \`/\${data.target_map.css_path}?t=\${Date.now()}\`;\n`;
    script += `                newLink.onload = () => oldLink?.remove();\n`;
    script += `                document.head.appendChild(newLink);\n`;
    script += `            }\n`;

    script += `            const newScriptPath = \`/\${data.target_map.path}?t=\${Date.now()}\`;\n\n`;
    script += `            const oldScript = document.getElementById("${AppData["BunextClientHydrationScriptID"]}");\n`;
    script += `            if (oldScript) {\n`;
    script += `                oldScript.remove();\n`;
    script += `            }\n\n`;
    script += `            const newScript = document.createElement("script");\n`;
    script += `            newScript.id = "${AppData["BunextClientHydrationScriptID"]}";\n`;
    script += `            newScript.type = "module";\n`;
    script += `            newScript.src = newScriptPath;\n`;
    // script += `            console.log("newScript", newScript);\n`;
    script += `            document.head.appendChild(newScript);\n\n`;
    script += `        } catch (err) {\n`;
    script += `            console.error("HMR update failed, falling back to reload:", err.message);\n`;
    // script += `            window.location.reload();\n`;
    script += `        }\n`;
    script += `    }\n`;
    script += `});\n`;

    return script;
}

// import grabDirNames from "../../../utils/grab-dir-names";
// import type { BundlerCTXMap, PageDistGenParams } from "../../../types";

// const { BUNX_HYDRATION_SRC_DIR } = grabDirNames();

// type Params = {
//     bundledMap?: BundlerCTXMap;
// };

// export default async function ({ bundledMap }: Params) {
//     let script = "";

//     // script += `import React from "react";\n`;
//     // script += `import { hydrateRoot } from "react-dom/client";\n`;
//     // script += `import App from "${page_file}";\n`;

//     // script += `declare global {\n`;
//     // script += `    interface Window {\n`;
//     // script += `        ${ClientWindowPagePropsName}: any;\n`;
//     // script += `    }\n`;
//     // script += `}\n`;

//     // script += `let root: any = null;\n\n`;
//     // script += `const component = <App {...window.${ClientWindowPagePropsName}} />;\n\n`;
//     // script += `const container = document.getElementById("${ClientRootElementIDName}");\n\n`;
//     // script += `if (container) {\n`;
//     // script += `    root = hydrateRoot(container, component);\n`;
//     // script += `}\n\n`;
//     script += `console.log(\`Development Environment\`);\n`;
//     // script += `console.log(import.meta);\n`;

//     // script += `if (import.meta.hot) {\n`;
//     // script += `    console.log(\`HMR active\`);\n`;
//     // script += `    import.meta.hot.dispose(() => {\n`;
//     // script += `        console.log("dispose");\n`;
//     // script += `    });\n`;
//     // script += `}\n`;

//     script += `const hmr = new EventSource("/__hmr");\n`;
//     script += `hmr.addEventListener("update", async (event) => {\n`;
//     // script += `    console.log(\`HMR even received:\`, event);\n`;
//     script += `    if (event.data) {\n`;
//     script += `        console.log(\`HMR Changes Detected. Reloading ...\`);\n`;
//     // script += `        console.log("event", event);\n`;
//     // script += `        console.log("window.${ClientRootComponentWindowName}", window.${ClientRootComponentWindowName});\n\n`;
//     // script += `        const event_data = JSON.parse(event.data);\n\n`;
//     // script += `        const new_js_path = \`/\${event_data.target_map.path}\`;\n\n`;

//     // script += `        console.log("event_data", event_data);\n\n`;
//     // script += `        console.log("new_js_path", new_js_path);\n\n`;

//     // script += `        if (window.${ClientRootComponentWindowName}) {\n`;
//     // script += `            const new_component = await import(new_js_path);\n`;
//     // script += `            window.${ClientRootComponentWindowName}.render(new_component);\n`;
//     // script += `        }\n`;

//     // script += `        import("${page_file}?t=" + event.data.update).then((module) => {\n`;
//     // script += `            root.render(module.default);\n`;
//     // script += `        })\n`;
//     // script += `        console.log("root", root);\n`;
//     // script += `        root.unmount();\n`;
//     // script += `        const container = document.getElementById("${ClientRootElementIDName}");\n\n`;
//     // script += `        root = hydrateRoot(container!, component);\n`;
//     // script += `        window.history.pushState({ page: 1 }, "New Page Title", \`\${window.location.pathname}?v=\${Date.now()}\`);\n`;
//     // script += `        root.render(component);\n`;
//     script += `        window.location.reload();\n`;
//     script += `    }\n`;
//     script += ` });\n`;

//     return script;
// }
