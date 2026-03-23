import { renderToString } from "react-dom/server";
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
    const importMap = JSON.stringify({
        imports: {
            react: `https://esm.sh/react@${_reactVersion}${devSuffix}`,
            "react-dom": `https://esm.sh/react-dom@${_reactVersion}${devSuffix}`,
            "react-dom/client": `https://esm.sh/react-dom@${_reactVersion}/client${devSuffix}`,
            "react/jsx-runtime": `https://esm.sh/react@${_reactVersion}/jsx-runtime${devSuffix}`,
            "react/jsx-dev-runtime": `https://esm.sh/react@${_reactVersion}/jsx-dev-runtime${devSuffix}`,
        },
    });

    let final_component = (
        <html {...html_props}>
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />

                {root_meta ? grabWebMetaHTML({ meta: root_meta }) : null}
                {page_meta ? grabWebMetaHTML({ meta: page_meta }) : null}

                {bundledMap?.css_path ? (
                    <link rel="stylesheet" href={`/${bundledMap.css_path}`} />
                ) : null}

                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.${ClientWindowPagePropsName} = ${serializedProps}`,
                    }}
                />

                {bundledMap?.path ? (
                    <>
                        <script
                            type="importmap"
                            dangerouslySetInnerHTML={{
                                __html: importMap,
                            }}
                            fetchPriority="high"
                        />
                        <script
                            src={`/${bundledMap.path}`}
                            type="module"
                            id={AppData["BunextClientHydrationScriptID"]}
                            defer
                        />
                    </>
                ) : null}

                {is_dev ? (
                    <script
                        defer
                        dangerouslySetInnerHTML={{
                            __html: page_hydration_script,
                        }}
                    />
                ) : null}

                {RootHead ? (
                    <RootHead serverRes={pageProps} ctx={routeParams} />
                ) : null}
                {Head ? <Head serverRes={pageProps} ctx={routeParams} /> : null}
            </head>
            <body>
                <div id={ClientRootElementIDName}>{component}</div>
            </body>
        </html>
    );

    let html = `<!DOCTYPE html>\n`;
    html += renderToString(final_component);

    return html;
}
