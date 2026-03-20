import { writeFileSync } from "fs";
import * as esbuild from "esbuild";
import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import { execSync } from "child_process";
import { log } from "../../utils/log";
import tailwindEsbuildPlugin from "../server/web-pages/tailwind-esbuild-plugin";
import grabClientHydrationScript from "./grab-client-hydration-script";
import grabArtifactsFromBundledResults from "./grab-artifacts-from-bundled-result";
const { HYDRATION_DST_DIR, HYDRATION_DST_DIR_MAP_JSON_FILE } = grabDirNames();
export default async function allPagesBundler(params) {
    const pages = grabAllPages({ exclude_api: true });
    const virtualEntries = {};
    const dev = isDevelopment();
    for (const page of pages) {
        const key = page.local_path;
        const txt = grabClientHydrationScript({
            page_local_path: page.local_path,
        });
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
            let buildStart = 0;
            build.onStart(() => {
                buildStart = performance.now();
            });
            build.onEnd((result) => {
                if (result.errors.length > 0)
                    return;
                const artifacts = grabArtifactsFromBundledResults({
                    pages,
                    result,
                });
                if (artifacts?.[0] && artifacts.length > 0) {
                    global.BUNDLER_CTX_MAP = artifacts;
                    global.PAGE_FILES = pages;
                    params?.post_build_fn?.({ artifacts });
                    writeFileSync(HYDRATION_DST_DIR_MAP_JSON_FILE, JSON.stringify(artifacts));
                }
                const elapsed = (performance.now() - buildStart).toFixed(0);
                log.success(`[Built] in ${elapsed}ms`);
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
        plugins: [tailwindEsbuildPlugin, virtualPlugin, artifactTracker],
        jsx: "automatic",
        splitting: true,
        logLevel: "silent",
    });
    await ctx.rebuild();
    if (params?.watch) {
        global.BUNDLER_CTX = ctx;
        global.BUNDLER_CTX.watch();
    }
}
