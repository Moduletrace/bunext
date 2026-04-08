import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import grabContants from "../../../utils/grab-constants";
import EJSON from "../../../utils/ejson";
import isDevelopment from "../../../utils/is-development";
import grabWebPageHydrationScript from "./grab-web-page-hydration-script";
import grabWebMetaHTML from "./grab-web-meta-html";
import { log } from "../../../utils/log";
import { AppData } from "../../../data/app-data";
import _ from "lodash";
import grabDirNames from "../../../utils/grab-dir-names";
const { ROOT_DIR } = grabDirNames();
export default async function genWebHTML({ component, pageProps, bundledMap, module, routeParams, debug, root_module, }) {
    const { ClientRootElementIDName, ClientWindowPagePropsName } = grabContants();
    const { renderToReadableStream } = await import(`${ROOT_DIR}/node_modules/react-dom/server.js`);
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
    const final_meta = _.merge(root_meta, page_meta);
    let final_component = (_jsxs("html", { ...html_props, children: [_jsxs("head", { children: [_jsx("meta", { charSet: "utf-8", "data-bunext-head": true }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0", "data-bunext-head": true }), final_meta ? grabWebMetaHTML({ meta: final_meta }) : null, bundledMap?.css_path ? (_jsx("link", { rel: "stylesheet", href: `/${bundledMap.css_path}`, "data-bunext-head": true })) : null, _jsx("script", { dangerouslySetInnerHTML: {
                            __html: `window.${ClientWindowPagePropsName} = ${serializedProps}`,
                        }, "data-bunext-head": true }), RootHead ? (_jsx(RootHead, { serverRes: pageProps, ctx: routeParams })) : null, Head ? _jsx(Head, { serverRes: pageProps, ctx: routeParams }) : null, bundledMap?.path ? (_jsxs(_Fragment, { children: [_jsx("script", { type: "importmap", dangerouslySetInnerHTML: {
                                    __html: JSON.stringify(global.REACT_IMPORTS_MAP),
                                }, defer: true, "data-bunext-head": true }), _jsx("script", { src: `/${bundledMap.path}`, type: "module", id: AppData["BunextClientHydrationScriptID"], defer: true, "data-bunext-head": true })] })) : null, is_dev ? (_jsx("script", { defer: true, dangerouslySetInnerHTML: {
                            __html: page_hydration_script,
                        }, "data-bunext-head": true })) : null] }), _jsx("body", { children: _jsx("div", { id: ClientRootElementIDName, suppressHydrationWarning: !dev, children: component }) })] }));
    let html = `<!DOCTYPE html>\n`;
    const stream = await renderToReadableStream(final_component, {
        onError(error) {
            if (error.message.includes('unique "key" prop'))
                return;
            console.error(error);
        },
    });
    const htmlBody = await new Response(stream).text();
    // const originalConsole = {
    //     log: console.log,
    //     warn: console.warn,
    //     error: console.error,
    //     info: console.info,
    //     debug: console.debug,
    // };
    // console.log = () => {};
    // console.warn = () => {};
    // console.error = () => {};
    // console.info = () => {};
    // console.debug = () => {};
    // const stream = await renderToReadableStream(final_component, {
    //     onError(error: any) {
    //         if (error.message.includes('unique "key" prop')) return;
    //         originalConsole.error(error);
    //     },
    // });
    // const htmlBody = await new Response(stream).text();
    // Object.assign(console, originalConsole);
    html += htmlBody;
    return html;
}
