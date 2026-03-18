import { existsSync, writeFileSync } from "fs";
import path from "path";
import * as esbuild from "esbuild";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { readFile } from "fs/promises";
import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import AppNames from "../../utils/grab-app-names";
import isDevelopment from "../../utils/is-development";
import { execSync } from "child_process";
import grabConstants from "../../utils/grab-constants";
const { HYDRATION_DST_DIR, PAGES_DIR, HYDRATION_DST_DIR_MAP_JSON_FILE } = grabDirNames();
const tailwindPlugin = {
    name: "tailwindcss",
    setup(build) {
        build.onLoad({ filter: /\.css$/ }, async (args) => {
            const source = await readFile(args.path, "utf-8");
            const result = await postcss([tailwindcss()]).process(source, {
                from: args.path,
            });
            return {
                contents: result.css,
                loader: "css",
            };
        });
    },
};
export default async function allPagesBundler(params) {
    const pages = grabAllPages({ exclude_api: true });
    const { ClientRootElementIDName, ClientRootComponentWindowName } = grabConstants();
    const virtualEntries = {};
    const dev = isDevelopment();
    const root_component_path = path.join(PAGES_DIR, `${AppNames["RootPagesComponentName"]}.tsx`);
    const does_root_exist = existsSync(root_component_path);
    for (const page of pages) {
        const key = page.local_path;
        let txt = ``;
        txt += `import { hydrateRoot } from "react-dom/client";\n`;
        if (does_root_exist) {
            txt += `import Root from "${root_component_path}";\n`;
        }
        txt += `import Page from "${page.local_path}";\n\n`;
        txt += `const pageProps = window.__PAGE_PROPS__ || {};\n`;
        if (does_root_exist) {
            txt += `const component = <Root {...pageProps}><Page {...pageProps} /></Root>\n`;
        }
        else {
            txt += `const component = <Page {...pageProps} />\n`;
        }
        txt += `const root = hydrateRoot(document.getElementById("${ClientRootElementIDName}"), component);\n\n`;
        txt += `window.${ClientRootComponentWindowName} = root;\n`;
        virtualEntries[key] = txt;
    }
    const virtualPlugin = {
        name: "virtual-entrypoints",
        setup(build) {
            build.onResolve({ filter: /^virtual:/ }, (args) => ({
                path: args.path.replace("virtual:", ""),
                namespace: "virtual",
            }));
            build.onLoad({ filter: /.*/, namespace: "virtual" }, (args) => ({
                contents: virtualEntries[args.path],
                loader: "tsx",
                resolveDir: process.cwd(),
            }));
        },
    };
    const artifactTracker = {
        name: "artifact-tracker",
        setup(build) {
            build.onStart(() => {
                console.time("build");
            });
            build.onEnd((result) => {
                if (result.errors.length > 0)
                    return;
                const artifacts = Object.entries(result.metafile.outputs)
                    .filter(([, meta]) => meta.entryPoint)
                    .map(([outputPath, meta]) => {
                    const target_page = pages.find((p) => {
                        return (meta.entryPoint === `virtual:${p.local_path}`);
                    });
                    if (!target_page || !meta.entryPoint) {
                        return undefined;
                    }
                    const { file_name, local_path, url_path } = target_page;
                    const cssPath = meta.cssBundle || undefined;
                    return {
                        path: outputPath,
                        hash: path.basename(outputPath, path.extname(outputPath)),
                        type: outputPath.endsWith(".css")
                            ? "text/css"
                            : "text/javascript",
                        entrypoint: meta.entryPoint,
                        css_path: cssPath,
                        file_name,
                        local_path,
                        url_path,
                    };
                });
                if (artifacts.length > 0) {
                    const final_artifacts = artifacts.filter((a) => Boolean(a?.entrypoint));
                    global.BUNDLER_CTX_MAP = final_artifacts;
                    params?.post_build_fn?.({ artifacts: final_artifacts });
                    writeFileSync(HYDRATION_DST_DIR_MAP_JSON_FILE, JSON.stringify(artifacts));
                }
                console.timeEnd("build");
                if (params?.exit_after_first_build) {
                    process.exit();
                }
            });
        },
    };
    execSync(`rm -rf ${HYDRATION_DST_DIR}`);
    const ctx = await esbuild.context({
        entryPoints: Object.keys(virtualEntries).map((k) => `virtual:${k}`),
        outdir: HYDRATION_DST_DIR,
        bundle: true,
        minify: true,
        format: "esm",
        target: "es2020",
        platform: "browser",
        define: {
            "process.env.NODE_ENV": JSON.stringify(dev ? "development" : "production"),
        },
        entryNames: "[dir]/[name]/[hash]",
        metafile: true,
        plugins: [tailwindPlugin, virtualPlugin, artifactTracker],
        jsx: "automatic",
        splitting: true,
    });
    await ctx.rebuild();
    if (params?.watch) {
        global.BUNDLER_CTX = ctx;
        global.BUNDLER_CTX.watch();
    }
}
