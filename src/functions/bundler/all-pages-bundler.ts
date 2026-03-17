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
import type { BundlerCTXMap } from "../../types";
import { execSync } from "child_process";
import grabConstants from "../../utils/grab-constants";
import rebuildBundler from "../server/rebuild-bundler";

const { HYDRATION_DST_DIR, PAGES_DIR, HYDRATION_DST_DIR_MAP_JSON_FILE } =
    grabDirNames();

const tailwindPlugin: esbuild.Plugin = {
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

type Params = {
    watch?: boolean;
    exit_after_first_build?: boolean;
    post_build_fn?: (params: { artifacts: BundlerCTXMap[] }) => Promise<void>;
};

export default async function allPagesBundler(params?: Params) {
    const pages = grabAllPages({ exclude_api: true });
    const {
        ClientRootElementIDName,
        ClientRootComponentWindowName,
        MaxBundlerRebuilds,
    } = await grabConstants();

    // Use index-based keys so bracket paths (e.g. [[...catch_all]]) never
    // appear in any path that esbuild's binary tracks internally. The actual
    // file path is only ever used inside our JS plugin callbacks.
    const virtualEntries: Record<string, string> = {};
    const dev = isDevelopment();

    const root_component_path = path.join(
        PAGES_DIR,
        `${AppNames["RootPagesComponentName"]}.tsx`,
    );

    const does_root_exist = existsSync(root_component_path);

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const virtualKey = `page-${i}`;

        let txt = ``;
        txt += `import { hydrateRoot } from "react-dom/client";\n`;
        if (does_root_exist) {
            txt += `import Root from "${root_component_path}";\n`;
        }
        txt += `import Page from "page-entry:${i}";\n\n`;
        txt += `const pageProps = window.__PAGE_PROPS__ || {};\n`;

        if (does_root_exist) {
            txt += `const component = <Root {...pageProps}><Page {...pageProps} /></Root>\n`;
        } else {
            txt += `const component = <Page {...pageProps} />\n`;
        }
        txt += `const root = hydrateRoot(document.getElementById("${ClientRootElementIDName}"), component);\n\n`;
        txt += `window.${ClientRootComponentWindowName} = root;\n`;

        virtualEntries[virtualKey] = txt;
    }

    const virtualPlugin: esbuild.Plugin = {
        name: "virtual-entrypoints",
        setup(build) {
            build.onResolve({ filter: /^virtual:/ }, (args) => ({
                path: args.path.replace("virtual:", ""),
                namespace: "virtual",
            }));

            build.onResolve({ filter: /^page-entry:/ }, (args) => ({
                path: args.path.replace("page-entry:", ""),
                namespace: "page-entry",
            }));

            build.onLoad({ filter: /.*/, namespace: "virtual" }, (args) => ({
                contents: virtualEntries[args.path],
                loader: "tsx",
                resolveDir: process.cwd(),
            }));

            build.onLoad(
                { filter: /.*/, namespace: "page-entry" },
                async (args) => {
                    const page = pages[parseInt(args.path)];
                    try {
                        return {
                            contents: await readFile(page.local_path, "utf-8"),
                            loader: "tsx" as const,
                            resolveDir: path.dirname(page.local_path),
                            watchFiles: [page.local_path],
                        };
                    } catch (e: any) {
                        return { errors: [{ text: e.message }] };
                    }
                },
            );
        },
    };

    const artifactTracker: esbuild.Plugin = {
        name: "artifact-tracker",
        setup(build) {
            build.onStart(() => {
                console.time("build");
            });

            build.onEnd(async (result) => {
                if (result.errors.length > 0) {
                    const messages = await esbuild.formatMessages(
                        result.errors,
                        { kind: "error", color: true },
                    );
                    for (const msg of messages) {
                        process.stderr.write(msg);
                    }

                    global.BUNDLER_REBUILDS++;

                    if (global.BUNDLER_REBUILDS > MaxBundlerRebuilds) {
                        console.error(`Max Rebuilds all failed.`);
                        process.exit(1);
                    }

                    await rebuildBundler();
                    console.timeEnd("build");
                    return;
                }

                const artifacts: (BundlerCTXMap | undefined)[] = Object.entries(
                    result.metafile!.outputs,
                )
                    .filter(([, meta]) => meta.entryPoint)
                    .map(([outputPath, meta]) => {
                        const indexMatch =
                            meta.entryPoint?.match(/^virtual:page-(\d+)$/);
                        const target_page = indexMatch
                            ? pages[parseInt(indexMatch[1])]
                            : undefined;

                        if (!target_page || !meta.entryPoint) {
                            return undefined;
                        }

                        const { file_name, local_path, url_path } = target_page;

                        const cssPath = meta.cssBundle || undefined;

                        return {
                            path: outputPath,
                            hash: path.basename(
                                outputPath,
                                path.extname(outputPath),
                            ),
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
                    const final_artifacts = artifacts.filter((a) =>
                        Boolean(a?.entrypoint),
                    ) as BundlerCTXMap[];
                    // writeFileSync(
                    //     HYDRATION_DST_DIR_MAP_JSON_FILE,
                    //     JSON.stringify(final_artifacts),
                    // );

                    global.BUNDLER_CTX_MAP = final_artifacts;
                    global.BUNDLER_REBUILDS = 0;
                    params?.post_build_fn?.({ artifacts: final_artifacts });
                }

                console.timeEnd("build");

                writeFileSync(
                    HYDRATION_DST_DIR_MAP_JSON_FILE,
                    JSON.stringify(artifacts),
                );

                if (params?.exit_after_first_build) {
                    // console.log(
                    //     "global.BUNDLER_CTX_MAP",
                    //     global.BUNDLER_CTX_MAP,
                    // );
                    process.exit();
                }
            });
        },
    };

    execSync(`rm -rf ${HYDRATION_DST_DIR}`);

    const ctx = await esbuild.context({
        entryPoints: Object.keys(virtualEntries).map((k) => `virtual:${k}`), // ["virtual:page-0", ...]
        outdir: HYDRATION_DST_DIR,
        bundle: true,
        minify: !dev,
        format: "esm",
        target: "es2020",
        platform: "browser",
        define: {
            "process.env.NODE_ENV": JSON.stringify(
                dev ? "development" : "production",
            ),
        },
        entryNames: "[dir]/[name]/[hash]",
        // entryNames: "[name]/[hash]",
        metafile: true,
        plugins: [tailwindPlugin, virtualPlugin, artifactTracker],
        jsx: "automatic",
    });

    await ctx.rebuild().catch((error: any) => {
        console.error(`Build failed:`, error.message);
    });

    if (params?.watch) {
        global.BUNDLER_CTX = ctx;
        global.BUNDLER_CTX.watch();
    }
}

// import plugin from "bun-plugin-tailwind";
// import { readdirSync, statSync, unlinkSync, writeFileSync } from "fs";
// import grabAllPages from "../../utils/grab-all-pages";
// import grabDirNames from "../../utils/grab-dir-names";
// import grabPageName from "../../utils/grab-page-name";
// import writeWebPageHydrationScript from "../server/web-pages/write-web-page-hydration-script";
// import path from "path";
// import bundle from "../../utils/bundle";
// import AppNames from "../../utils/grab-app-names";
// import type { PageFiles } from "../../types";
// import isDevelopment from "../../utils/is-development";
// import { execSync } from "child_process";

// const {
//     BUNX_HYDRATION_SRC_DIR,
//     HYDRATION_DST_DIR,
//     HYDRATION_DST_DIR_MAP_JSON_FILE,
// } = grabDirNames();

// export default async function allPagesBundler() {
//     console.time("build");

//     const pages = grabAllPages({ exclude_api: true });

//     for (let i = 0; i < pages.length; i++) {
//         const page = pages[i];

//         if (!isPageValid(page)) {
//             continue;
//         }

//         const pageName = grabPageName({ path: page.local_path });

//         writeWebPageHydrationScript({
//             pageName,
//             page_file: page.local_path,
//         });
//     }

//     // const hydration_files = readdirSync(BUNX_HYDRATION_SRC_DIR);

//     // for (let i = 0; i < hydration_files.length; i++) {
//     //     const hydration_file = hydration_files[i];

//     //     const valid_file = pages.find((p) => {
//     //         if (!isPageValid(p)) {
//     //             return false;
//     //         }

//     //         const pageName = grabPageName({ path: p.local_path });

//     //         const file_tsx_name = `${pageName}.tsx`;
//     //         if (file_tsx_name == hydration_file) {
//     //             return true;
//     //         }
//     //         return false;
//     //     });

//     //     if (!valid_file) {
//     //         unlinkSync(path.join(BUNX_HYDRATION_SRC_DIR, hydration_file));
//     //     }
//     // }

//     // const entrypoints = readdirSync(BUNX_HYDRATION_SRC_DIR)
//     //     .filter((f) => f.endsWith(".tsx"))
//     //     .map((f) => path.join(BUNX_HYDRATION_SRC_DIR, f))
//     //     .filter((f) => statSync(f).isFile());

//     const entrypoints = pages.map((p) => p.local_path);

//     // execSync(`rm -rf ${HYDRATION_DST_DIR}`);

//     // bundle({
//     //     src: entrypoints.join(" "),
//     //     out_dir: HYDRATION_DST_DIR,
//     //     exec_options: { stdio: "ignore" },
//     //     entry_naming: `[dir]/[name]/[hash].js`,
//     //     minify: true,
//     //     target: "browser",
//     // });

//     // console.log(`Bundling ...`);

//     const result = await Bun.build({
//         entrypoints,
//         outdir: HYDRATION_DST_DIR,
//         plugins: [plugin],
//         minify: true,
//         target: "browser",
//         // sourcemap: "linked",
//         define: {
//             "process.env.NODE_ENV": JSON.stringify(
//                 isDevelopment() ? "development" : "production",
//             ),
//         },
//         naming: "[dir]/[name]/[hash].js",
//     });

//     const artifacts = result.outputs.map(({ path, hash, type }) => {
//         const target_page = pages.find((p) =>
//             p.local_path.replace(/src\/pages/, "public/pages"),
//         );

//         return {
//             path,
//             hash,
//             type,
//             ...target_page,
//         };
//     });

//     if (artifacts?.[0]) {
//         writeFileSync(
//             HYDRATION_DST_DIR_MAP_JSON_FILE,
//             JSON.stringify(artifacts),
//         );
//     }

//     console.timeEnd("build");
// }

// function isPageValid(page: PageFiles): boolean {
//     if (page.file_name == AppNames["RootPagesComponentName"]) {
//         return false;
//     }

//     if (page.url_path.match(/\(|\)|--/)) {
//         return false;
//     }

//     return true;
// }
