import { AppData } from "../../../data/app-data";
import grabConstants from "../../../utils/grab-constants";
export default async function (params) {
    const { ClientWindowPagePropsName } = grabConstants();
    let script = "";
    script += `console.log(\`Development Environment\`);\n\n`;
    const errors_to_supress = [
        "hydrat",
        "react/jsx-dev-runtime",
        "react/jsx-runtime",
    ];
    const supress_condition = errors_to_supress
        .map((e) => `args[0].includes("${e}")`)
        .join(" || ");
    const runtime_supress_condition = errors_to_supress
        .map((e) => `message.includes("${e}")`)
        .join(" || ");
    script += `const _ce = console.error.bind(console);\n`;
    script += `console.error = (...args) => {\n`;
    script += `    if (typeof args[0] === "string" && (${supress_condition})) return;\n`;
    script += `    _ce(...args);\n`;
    script += `};\n\n`;
    script += `function __bunext_show_error(message, source, stack) {\n`;
    script += `    const existing = document.getElementById("__bunext_error_overlay");\n`;
    script += `    if (existing) existing.remove();\n`;
    script += `    const overlay = document.createElement("div");\n`;
    script += `    overlay.id = "__bunext_error_overlay";\n`;
    script += `    overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:#1a1a1a;color:#ff6b6b;font-family:monospace;font-size:14px;padding:24px;overflow:auto;";\n`;
    script += `    overlay.innerHTML = \`<div style="max-width:900px;margin:0 auto"><div style="font-size:18px;font-weight:bold;margin-bottom:12px;color:#ff4444">Runtime Error</div><div style="color:#fff;margin-bottom:16px">\${message}</div>\${source ? \`<div style="color:#888;margin-bottom:16px">\${source}</div>\` : ""}\${stack ? \`<pre style="background:#111;padding:16px;border-radius:6px;overflow:auto;color:#ffa07a;white-space:pre-wrap">\${stack}</pre>\` : ""}<button onclick="this.closest('#__bunext_error_overlay').remove()" style="margin-top:16px;padding:8px 16px;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer">Dismiss</button></div>\`;\n`;
    script += `    document.body.appendChild(overlay);\n`;
    script += `}\n\n`;
    script += `function __bunext_should_suppress_runtime_error(message) {\n`;
    script += `    return typeof message === "string" && (${runtime_supress_condition});\n`;
    script += `}\n\n`;
    script += `window.addEventListener("error", (e) => {\n`;
    script += `    const message = String(e.message ?? "");\n`;
    script += `    if (__bunext_should_suppress_runtime_error(message)) {\n`;
    script += `        e.preventDefault();\n`;
    script += `        e.stopImmediatePropagation();\n`;
    script += `        return;\n`;
    script += `    }\n`;
    script += `    __bunext_show_error(message, e.filename ? e.filename + ":" + e.lineno + ":" + e.colno : "", e.error?.stack ?? "");\n`;
    script += `});\n`;
    script += `window.addEventListener("unhandledrejection", (e) => {\n`;
    script += `    const message = String(e.reason?.message ?? e.reason ?? "");\n`;
    script += `    if (__bunext_should_suppress_runtime_error(message)) {\n`;
    script += `        e.preventDefault();\n`;
    script += `        return;\n`;
    script += `    }\n`;
    script += `    __bunext_show_error(message, "", e.reason?.stack ?? "");\n`;
    script += `});\n\n`;
    script += `const hmr = new EventSource("/__hmr");\n`;
    script += `window.BUNEXT_HMR = hmr;\n`;
    script += `window.addEventListener("beforeunload", () => hmr.close());\n`;
    script += `hmr.addEventListener("update", async (event) => {\n`;
    script += `    if (event?.data) {\n`;
    script += `        try {\n`;
    script += `            document.getElementById("__bunext_error_overlay")?.remove();\n`;
    script += `            const data = JSON.parse(event.data);\n`;
    // script += `            console.log("data", data);\n`;
    script += `            if (data.reload) {\n`;
    script += `                console.log(\`Root Changes Detected. Reloading Page ...\`);\n`;
    script += `                window.location.reload();\n`;
    script += `                return;\n`;
    script += `            }\n`;
    script += `            console.log(\`HMR Changes Detected. Updating ...\`);\n`;
    script += `            if (data.page_props) {\n`;
    script += `                window.${ClientWindowPagePropsName} = data.page_props;\n`;
    script += `            }\n`;
    script += `            const oldCSSLink = document.querySelector('link[rel="stylesheet"]');\n`;
    script += `            if (data.target_map.css_path) {\n`;
    script += `                const newLink = document.createElement("link");\n`;
    script += `                newLink.rel = "stylesheet";\n`;
    script += `                newLink.href = \`/\${data.target_map.css_path}?t=\${Date.now()}\`;\n`;
    script += `                newLink.onload = () => oldCSSLink?.remove();\n`;
    script += `                document.head.appendChild(newLink);\n`;
    script += `            } else if (oldCSSLink) {\n`;
    script += `                oldCSSLink.remove();\n`;
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
    // script += `            newScript.onerror  = (e) => {\n`;
    // script += `               window.location.reload();\n`;
    // script += `            }\n`;
    // script += `            console.log("newScript", newScript);\n`;
    script += `            document.head.appendChild(newScript);\n\n`;
    script += `        } catch (err) {\n`;
    script += `            console.error("HMR update failed, falling back to reload:", err.message);\n`;
    script += `            window.location.reload();\n`;
    script += `        }\n`;
    script += `    }\n`;
    script += `});\n`;
    return script;
}
