import * as esbuild from "esbuild";
import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import { log } from "../../utils/log";
import tailwindEsbuildPlugin from "../server/web-pages/tailwind-esbuild-plugin";
import grabClientHydrationScript from "./grab-client-hydration-script";
import grabArtifactsFromBundledResults from "./grab-artifacts-from-bundled-result";
import { writeFileSync } from "fs";
import type { BundlerCTXMap } from "../../types";
import recordArtifacts from "./record-artifacts";
import stripServerSideLogic from "./strip-server-side-logic";

const { HYDRATION_DST_DIR, HYDRATION_DST_DIR_MAP_JSON_FILE } = grabDirNames();

let build_starts = 0;
const MAX_BUILD_STARTS = 10;

type Params = {
    /**
     * Locations of the pages Files.
     */
    page_file_paths?: string[];
};

export default async function allPagesBundler(params?: Params) {
    const { page_file_paths } = params || {};

    const pages = grabAllPages({ exclude_api: true });

    const target_pages = page_file_paths?.[0]
        ? pages.filter((p) => page_file_paths.includes(p.local_path))
        : pages;

    if (!page_file_paths) {
        global.PAGE_FILES = pages;
    }

    const virtualEntries: Record<string, string> = {};
    const dev = isDevelopment();

    for (const page of target_pages) {
        const key = page.local_path;

        const txt = await grabClientHydrationScript({
            page_local_path: page.local_path,
        });

        // if (page.url_path == "/index") {
        //     console.log("txt", txt);
        // }

        if (!txt) continue;

        // const final_tsx = stripServerSideLogic({
        //     txt_code: txt,
        //     file_path: key,
        // });

        // console.log("final_tsx", final_tsx);

        virtualEntries[key] = txt;
    }

    const virtualPlugin: esbuild.Plugin = {
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

    let buildStart = 0;

    const artifactTracker: esbuild.Plugin = {
        name: "artifact-tracker",
        setup(build) {
            build.onStart(() => {
                build_starts++;
                buildStart = performance.now();

                if (build_starts == MAX_BUILD_STARTS) {
                    const error_msg = `Build Failed. Please check all your components and imports.`;
                    log.error(error_msg);
                    process.exit(1);
                }
            });

            // build.onEnd((result) => {

            // });
        },
    };

    const entryPoints = Object.keys(virtualEntries).map((k) => `virtual:${k}`);

    // let alias: any = {};
    // const excludes = [
    //     "bun:sqlite",
    //     "path",
    //     "url",
    //     "events",
    //     "util",
    //     "crypto",
    //     "net",
    //     "tls",
    //     "fs",
    //     "node:path",
    //     "node:url",
    //     "node:process",
    //     "node:fs",
    //     "node:timers/promises",
    // ];

    // for (let i = 0; i < excludes.length; i++) {
    //     const exclude = excludes[i];
    //     alias[exclude] = "./empty.js";
    // }

    // console.log("alias", alias);

    const result = await esbuild.build({
        entryPoints,
        outdir: HYDRATION_DST_DIR,
        bundle: true,
        minify: true,
        format: "esm",
        target: "es2020",
        platform: "browser",
        define: {
            "process.env.NODE_ENV": JSON.stringify(
                dev ? "development" : "production",
            ),
        },
        entryNames: "[dir]/[hash]",
        metafile: true,
        plugins: [tailwindEsbuildPlugin, virtualPlugin, artifactTracker],
        jsx: "automatic",
        // splitting: true,
        // logLevel: "silent",
        external: [
            "react",
            "react-dom",
            "react-dom/client",
            "react/jsx-runtime",
        ],
        // alias,
    });

    if (result.errors.length > 0) {
        for (const error of result.errors) {
            const loc = error.location;
            const location = loc
                ? ` ${loc.file}:${loc.line}:${loc.column}`
                : "";
            log.error(`[Build]${location} ${error.text}`);
        }
        return;
    }

    const artifacts = grabArtifactsFromBundledResults({
        pages: target_pages,
        result,
    });

    if (artifacts?.[0]) {
        await recordArtifacts({ artifacts });
    }

    const elapsed = (performance.now() - buildStart).toFixed(0);
    log.success(`[Built] in ${elapsed}ms`);

    global.RECOMPILING = false;

    build_starts = 0;
}
