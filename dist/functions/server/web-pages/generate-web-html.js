import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import grabContants from "../../../utils/grab-constants";
import EJSON from "../../../utils/ejson";
import isDevelopment from "../../../utils/is-development";
import grabWebPageHydrationScript from "./grab-web-page-hydration-script";
import grabWebMetaHTML from "./grab-web-meta-html";
import { log } from "../../../utils/log";
import { AppData } from "../../../data/app-data";
import { readFileSync } from "fs";
import path from "path";
let _reactVersion = "19";
try {
    _reactVersion = JSON.parse(readFileSync(path.join(process.cwd(), "node_modules/react/package.json"), "utf-8")).version;
}
catch { }
export default async function genWebHTML({ component, pageProps, bundledMap, module, routeParams, debug, root_module, }) {
    const { ClientRootElementIDName, ClientWindowPagePropsName } = grabContants();
    const is_dev = isDevelopment();
    if (debug) {
        log.info("component", component);
    }
    const serializedProps = (EJSON.stringify(pageProps || {}) || "{}").replace(/<\//g, "<\\/");
    const page_hydration_script = await grabWebPageHydrationScript();
    const root_meta = root_module?.meta
        ? typeof root_module.meta == "function" && routeParams
            ? await root_module.meta({ ctx: routeParams, serverRes: pageProps })
            : typeof root_module.meta == "function"
                ? undefined
                : root_module.meta
        : undefined;
    const page_meta = module?.meta
        ? typeof module.meta == "function" && routeParams
            ? await module.meta({ ctx: routeParams, serverRes: pageProps })
            : typeof module.meta == "function"
                ? undefined
                : module.meta
        : undefined;
    const html_props = {
        ...module?.html_props,
        ...root_module?.html_props,
    };
    const Head = module?.Head;
    const RootHead = root_module?.Head;
    const dev = isDevelopment();
    const devSuffix = dev ? "?dev" : "";
    const browser_imports = {
        react: `https://esm.sh/react@${_reactVersion}`,
        "react-dom": `https://esm.sh/react-dom@${_reactVersion}`,
        "react-dom/client": `https://esm.sh/react-dom@${_reactVersion}/client`,
        "react/jsx-runtime": `https://esm.sh/react@${_reactVersion}/jsx-runtime`,
    };
    if (dev) {
        browser_imports["react/jsx-dev-runtime"] =
            `https://esm.sh/react@${_reactVersion}/jsx-dev-runtime`;
    }
    const importMap = JSON.stringify({
        imports: browser_imports,
    });
    let final_component = (_jsxs("html", { ...html_props, children: [_jsxs("head", { children: [_jsx("meta", { charSet: "utf-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }), root_meta ? grabWebMetaHTML({ meta: root_meta }) : null, page_meta ? grabWebMetaHTML({ meta: page_meta }) : null, bundledMap?.css_path ? (_jsx("link", { rel: "stylesheet", href: `/${bundledMap.css_path}` })) : null, _jsx("script", { dangerouslySetInnerHTML: {
                            __html: `window.${ClientWindowPagePropsName} = ${serializedProps}`,
                        } }), bundledMap?.path ? (_jsxs(_Fragment, { children: [_jsx("script", { type: "importmap", dangerouslySetInnerHTML: {
                                    __html: importMap,
                                }, fetchPriority: "high" }), _jsx("script", { src: `/${bundledMap.path}`, type: "module", id: AppData["BunextClientHydrationScriptID"], defer: true })] })) : null, is_dev ? (_jsx("script", { defer: true, dangerouslySetInnerHTML: {
                            __html: page_hydration_script,
                        } })) : null, RootHead ? (_jsx(RootHead, { serverRes: pageProps, ctx: routeParams })) : null, Head ? _jsx(Head, { serverRes: pageProps, ctx: routeParams }) : null] }), _jsx("body", { children: _jsx("div", { id: ClientRootElementIDName, suppressHydrationWarning: !dev, children: component }) })] }));
    let html = `<!DOCTYPE html>\n`;
    // const stream = await renderToReadableStream(final_component, {
    //     onError(error: any) {
    //         // This is where you "omit" or handle the errors
    //         // You can log it silently or ignore it
    //         if (error.message.includes('unique "key" prop')) return;
    //         console.error(error);
    //     },
    // });
    // // 2. Convert the Web Stream to a String (Bun-optimized)
    // const htmlBody = await new Response(stream).text();
    // html += htmlBody;
    html += renderToString(final_component);
    return html;
}
