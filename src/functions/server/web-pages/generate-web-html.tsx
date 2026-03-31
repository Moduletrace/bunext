import { renderToReadableStream, renderToString } from "react-dom/server";
import grabContants from "../../../utils/grab-constants";
import EJSON from "../../../utils/ejson";
import type { LivePageDistGenParams } from "../../../types";
import isDevelopment from "../../../utils/is-development";
import grabWebPageHydrationScript from "./grab-web-page-hydration-script";
import grabWebMetaHTML from "./grab-web-meta-html";
import { log } from "../../../utils/log";
import { AppData } from "../../../data/app-data";
import { readFileSync } from "fs";
import path from "path";
import _ from "lodash";
import grabDirNames from "../../../utils/grab-dir-names";

const {} = grabDirNames();

let _reactVersion = "19";
try {
    _reactVersion = JSON.parse(
        readFileSync(
            path.join(process.cwd(), "node_modules/react/package.json"),
            "utf-8",
        ),
    ).version;
} catch {}

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
    const devSuffix = dev ? "?dev" : "";

    // const browser_imports: Record<string, string> = {
    //     react: `/.bunext/react`,
    //     "react-dom": `/.bunext/react-dom`,
    //     "react-dom/client": `/.bunext/react-dom-client`,
    //     "react/jsx-runtime": `/.bunext/react-jsx-runtime`,
    //     "react/jsx-dev-runtime": `/.bunext/react-jsx-dev-runtime`,
    // };

    // const browser_imports: Record<string, string> = {
    //     react: `https://esm.sh/react@${_reactVersion}`,
    //     "react-dom": `https://esm.sh/react-dom@${_reactVersion}`,
    //     "react-dom/client": `https://esm.sh/react-dom@${_reactVersion}/client`,
    //     "react/jsx-runtime": `https://esm.sh/react@${_reactVersion}/jsx-runtime`,
    //     "react/jsx-dev-runtime": `https://esm.sh/react@${_reactVersion}/jsx-dev-runtime`,
    // };

    // if (dev) {
    //     browser_imports["react/jsx-dev-runtime"] =
    //         `https://esm.sh/react@${_reactVersion}/jsx-dev-runtime`;
    // }

    // const importMap = JSON.stringify({
    //     imports: browser_imports,
    // });

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

                {/* <link rel="preconnect" href="https://esm.sh" /> */}

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
                        {/* <script
                            type="importmap"
                        dangerouslySetInnerHTML={{
                                __html: importMap,
                            }}
                            defer
                            data-bunext-head
                        /> */}
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

    const stream = await renderToReadableStream(final_component, {
        onError(error: any) {
            // This is where you "omit" or handle the errors
            // You can log it silently or ignore it
            if (error.message.includes('unique "key" prop')) return;
            console.error(error);
        },
    });

    // 2. Convert the Web Stream to a String (Bun-optimized)
    const htmlBody = await new Response(stream).text();

    html += htmlBody;

    // html += renderToString(final_component);

    return html;
}
