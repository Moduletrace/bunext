import grabContants from "../../../utils/grab-constants";
import EJSON from "../../../utils/ejson";
import type { LivePageDistGenParams } from "../../../types";
import isDevelopment from "../../../utils/is-development";
import grabWebPageHydrationScript from "./grab-web-page-hydration-script";
import grabWebMetaHTML from "./grab-web-meta-html";
import { log } from "../../../utils/log";
import { AppData } from "../../../data/app-data";
import _ from "lodash";
import grabDirNames from "../../../utils/grab-dir-names";

const { ROOT_DIR } = grabDirNames();

export default async function genWebHTML({
    component,
    pageProps,
    bundledMap,
    module,
    routeParams,
    debug,
    root_module,
}: LivePageDistGenParams) {
    const { ClientRootElementIDName, ClientWindowPagePropsName } =
        grabContants();

    const { renderToReadableStream } = await import(
        `${ROOT_DIR}/node_modules/react-dom/server.js`
    );

    const is_dev = isDevelopment();

    if (debug) {
        log.info("component", component);
    }

    const serializedProps = (EJSON.stringify(pageProps || {}) || "{}").replace(
        /<\//g,
        "<\\/",
    );

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

    let final_component = (
        <html {...html_props}>
            <head>
                <meta charSet="utf-8" data-bunext-head />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                    data-bunext-head
                />

                {final_meta ? grabWebMetaHTML({ meta: final_meta }) : null}

                {bundledMap?.css_path ? (
                    <link
                        rel="stylesheet"
                        href={`/${bundledMap.css_path}`}
                        data-bunext-head
                    />
                ) : null}

                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.${ClientWindowPagePropsName} = ${serializedProps}`,
                    }}
                    data-bunext-head
                />

                {RootHead ? (
                    <RootHead serverRes={pageProps} ctx={routeParams} />
                ) : null}
                {Head ? <Head serverRes={pageProps} ctx={routeParams} /> : null}

                {bundledMap?.path ? (
                    <>
                        <script
                            type="importmap"
                            dangerouslySetInnerHTML={{
                                __html: JSON.stringify(
                                    global.REACT_IMPORTS_MAP,
                                ),
                            }}
                            defer
                            data-bunext-head
                        />
                        <script
                            src={`/${bundledMap.path}`}
                            type="module"
                            id={AppData["BunextClientHydrationScriptID"]}
                            defer
                            data-bunext-head
                        />
                    </>
                ) : null}

                {is_dev ? (
                    <script
                        defer
                        dangerouslySetInnerHTML={{
                            __html: page_hydration_script,
                        }}
                        data-bunext-head
                    />
                ) : null}
            </head>
            <body>
                <div
                    id={ClientRootElementIDName}
                    suppressHydrationWarning={!dev}
                >
                    {component}
                </div>
            </body>
        </html>
    );

    let html = `<!DOCTYPE html>\n`;

    // const stream = await renderToReadableStream(final_component, {
    //     onError(error: any) {
    //         if (error.message.includes('unique "key" prop')) return;
    //         console.error(error);
    //     },
    // });

    // const htmlBody = await new Response(stream).text();

    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug,
    };

    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};
    console.debug = () => {};

    const stream = await renderToReadableStream(final_component, {
        onError(error: any) {
            if (error.message.includes('unique "key" prop')) return;
            originalConsole.error(error);
        },
    });

    const htmlBody = await new Response(stream).text();

    Object.assign(console, originalConsole);

    html += htmlBody;

    return html;
}
