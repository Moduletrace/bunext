import { readFileSync, writeFileSync } from "fs";
import * as esbuild from "esbuild";
import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import type { BundlerCTXMap } from "../../types";
import { execSync } from "child_process";
import { log } from "../../utils/log";
import tailwindEsbuildPlugin from "../server/web-pages/tailwind-esbuild-plugin";
import grabClientHydrationScript from "./grab-client-hydration-script";
import grabArtifactsFromBundledResults from "./grab-artifacts-from-bundled-result";
import stripServerSideLogic from "./strip-server-side-logic";

const { HYDRATION_DST_DIR, HYDRATION_DST_DIR_MAP_JSON_FILE, ROOT_DIR } =
    grabDirNames();

let build_starts = 0;
const MAX_BUILD_STARTS = 10;

type Params = {
    watch?: boolean;
    exit_after_first_build?: boolean;
    post_build_fn?: (params: { artifacts: BundlerCTXMap[] }) => Promise<void>;
};

export default async function allPagesBundler(params?: Params) {
    const pages = grabAllPages({ exclude_api: true });

    const virtualEntries: Record<string, string> = {};
    const dev = isDevelopment();

    for (const page of pages) {
        const key = page.local_path;

        const txt = await grabClientHydrationScript({
            page_local_path: page.local_path,
        });

        if (!txt) continue;

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

            build.onLoad({ filter: /\.tsx$/ }, (args) => {
                if (args.path.includes("node_modules")) return;

                const source = readFileSync(args.path, "utf8");

                if (!source.includes("server")) {
                    return { contents: source, loader: "tsx" };
                }

                const strippedCode = stripServerSideLogic({ txt_code: source });

                return {
                    contents: strippedCode,
                    loader: "tsx",
                };
            });
        },
    };

    const artifactTracker: esbuild.Plugin = {
        name: "artifact-tracker",
        setup(build) {
            let buildStart = 0;

            build.onStart(() => {
                build_starts++;
                buildStart = performance.now();

                if (build_starts == MAX_BUILD_STARTS) {
                    const error_msg = `Build Failed. Please check all your components and imports.`;
                    log.error(error_msg);
                }
            });

            build.onEnd((result) => {
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
                    pages,
                    result,
                });

                if (artifacts?.[0] && artifacts.length > 0) {
                    global.BUNDLER_CTX_MAP = artifacts;
                    global.PAGE_FILES = pages;
                    params?.post_build_fn?.({ artifacts });

                    writeFileSync(
                        HYDRATION_DST_DIR_MAP_JSON_FILE,
                        JSON.stringify(artifacts),
                    );
                }

                const elapsed = (performance.now() - buildStart).toFixed(0);
                log.success(`[Built] in ${elapsed}ms`);

                global.RECOMPILING = false;

                if (params?.exit_after_first_build) {
                    process.exit();
                }

                build_starts = 0;
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
            "process.env.NODE_ENV": JSON.stringify(
                dev ? "development" : "production",
            ),
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
        // global.BUNDLER_CTX.watch();
    }
}
