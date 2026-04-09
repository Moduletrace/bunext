import isDevelopment from "../../../utils/is-development";
import * as esbuild from "esbuild";
import grabDirNames from "../../../utils/grab-dir-names";
import path from "path";
import tailwindEsbuildPlugin from "./tailwind-esbuild-plugin";
import type {
    GrabTSXModuleBatchParams,
    GrabTSXModuleSingleParams,
} from "../../../types";
import { existsSync, rmSync, unlinkSync } from "fs";

const { PAGES_DIR, BUNX_CWD_MODULE_CACHE_DIR, ROOT_DIR } = grabDirNames();

type Params = GrabTSXModuleSingleParams | GrabTSXModuleBatchParams;

function toModPath(page_file_path: string) {
    return path.join(
        BUNX_CWD_MODULE_CACHE_DIR,
        page_file_path.replace(PAGES_DIR, "").replace(/\.(t|j)sx?$/, ".js"),
    );
}

function isBatch(params: Params): params is GrabTSXModuleBatchParams {
    return "tsx_map" in params;
}

type BuildEntriesParams = {
    entries: { tsx: string; page_file_path: string }[];
    clean_cache?: boolean;
};

async function buildEntries({ entries, clean_cache }: BuildEntriesParams) {
    const dev = isDevelopment();

    const toBuild: {
        tsx: string;
        mod_file_path: string;
    }[] = [];

    for (const entry of entries) {
        const mod_file_path = toModPath(entry.page_file_path);

        // try {
        //     if (clean_cache && existsSync(mod_file_path)) {
        //         console.log(`Removing ${mod_file_path}`);
        //         await Bun.file(mod_file_path).delete();
        //     }
        // } catch (error) {}

        const does_mod_file_path_exists = existsSync(mod_file_path);

        if (!does_mod_file_path_exists) {
            toBuild.push({
                tsx: entry.tsx,
                mod_file_path,
            });
        }
    }

    if (toBuild.length === 0) return;

    const virtualEntries: Record<string, string> = {};

    for (const { tsx, mod_file_path } of toBuild) {
        virtualEntries[mod_file_path] = tsx;
    }

    const virtualPlugin: esbuild.Plugin = {
        name: "virtual-tsx-entries",
        setup(build) {
            const entryPaths = new Set(Object.keys(virtualEntries));

            build.onResolve({ filter: /.*/ }, (args) => {
                if (entryPaths.has(args.path)) {
                    return {
                        path: args.path,
                        namespace: "virtual",
                    };
                }
            });

            build.onLoad({ filter: /.*/, namespace: "virtual" }, (args) => ({
                contents: virtualEntries[args.path],
                resolveDir: process.cwd(),
                loader: "tsx",
            }));

            build.onEnd((result) => {
                if (result.errors.length > 0) {
                    console.log(`Build Errors =>`, result.errors);
                    return;
                }

                // const artifacts: any[] = Object.entries(
                //     result.metafile!.outputs,
                // )
                //     .filter(([, meta]) => meta.entryPoint)
                //     .map(([outputPath, meta]) => {
                //         return {
                //             path: outputPath,
                //             hash: path.basename(
                //                 outputPath,
                //                 path.extname(outputPath),
                //             ),
                //             type: outputPath.endsWith(".css")
                //                 ? "text/css"
                //                 : "text/javascript",
                //             entrypoint: meta.entryPoint,
                //             css_path: meta.cssBundle,
                //         };
                //     });

                // console.log("artifacts", artifacts);
            });
        },
    };

    const entryPoints = Object.keys(virtualEntries);

    const build = await esbuild.build({
        entryPoints,
        bundle: true,
        format: "esm",
        target: "es2020",
        platform: "node",
        external: [
            "react",
            "react-dom",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
        ],
        minify: !dev,
        define: {
            "process.env.NODE_ENV": JSON.stringify(
                dev ? "development" : "production",
            ),
        },
        jsx: "automatic",
        outdir: BUNX_CWD_MODULE_CACHE_DIR,
        plugins: [virtualPlugin, tailwindEsbuildPlugin],
        metafile: true,
        // logLevel: "silent",
    });
}

async function loadEntry<T>(page_file_path: string): Promise<T> {
    const now = Date.now();
    const mod_file_path = toModPath(page_file_path);
    const mod_css_path = mod_file_path.replace(/\.js$/, ".css");

    if (global.REACT_DOM_MODULE_CACHE.has(page_file_path)) {
        return global.REACT_DOM_MODULE_CACHE.get(page_file_path)?.main as T;
    }

    const mod = await import(`${mod_file_path}?t=${now}`);

    global.REACT_DOM_MODULE_CACHE.set(page_file_path, {
        main: mod,
        css: mod_css_path,
    });

    return mod as T;
}

export default async function grabTsxStringModule<T>(
    params: Params,
): Promise<T | T[]> {
    if (isBatch(params)) {
        try {
            await buildEntries({ entries: params.tsx_map });
        } catch (error) {
            console.error(`SSR Batch Build Error\n`);
            console.log(error);
        }
        return Promise.all(
            params.tsx_map.map((entry) => loadEntry<T>(entry.page_file_path)),
        );
    }

    try {
        await buildEntries({
            entries: [params],
            clean_cache: true,
        });
    } catch (error) {
        console.error(`SSR Single Build Error\n`);
        console.log(error);
    }

    return loadEntry<T>(params.page_file_path);
}

// export default async function grabTsxStringModule<T extends any = any>({
//     tsx,
// }: Params): Promise<T> {
//     const dev = isDevelopment();

//     const now = Date.now();
//     const { BUNX_CWD_MODULE_CACHE_DIR } = grabDirNames();
//     const target_cache_file_path = path.join(
//         BUNX_CWD_MODULE_CACHE_DIR,
//         `server-render-${now}.js`,
//     );

//     await esbuild.build({
//         stdin: {
//             contents: dev ? tsx + `\n// v_${now}` : tsx,
//             resolveDir: process.cwd(),
//             loader: "tsx",
//         },
//         bundle: true,
//         format: "esm",
//         target: "es2020",
//         platform: "node",
//         external: [
//             "react",
//             "react-dom",
//             "react/jsx-runtime",
//             "react/jsx-dev-runtime",
//         ],
//         minify: !dev,
//         define: {
//             "process.env.NODE_ENV": JSON.stringify(
//                 dev ? "development" : "production",
//             ),
//         },
//         jsx: "automatic",
//         outfile: target_cache_file_path,
//         plugins: [tailwindEsbuildPlugin],
//     });

//     Loader.registry.delete(target_cache_file_path);
//     const mod = await import(`${target_cache_file_path}?t=${now}`);

//     return mod as T;
// }

// if (!dev) {
//     const now = Date.now();

//     const final_tsx = dev ? tsx + `\n// v_${now}` : tsx;

//     const result = await esbuild.transform(final_tsx, {
//         loader: "tsx",
//         format: "esm",
//         jsx: "automatic",
//         minify: !dev,
//     });

//     const blob = new Blob([result.code], { type: "text/javascript" });
//     const url = URL.createObjectURL(blob);
//     const mod = await import(url);

//     URL.revokeObjectURL(url);

//     return mod as T;
// }
