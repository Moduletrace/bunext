import * as esbuild from "esbuild";
import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import { log } from "../../utils/log";
import tailwindEsbuildPlugin from "../server/web-pages/tailwind-esbuild-plugin";
import grabClientHydrationScript from "./grab-client-hydration-script";
import grabArtifactsFromBundledResults from "./grab-artifacts-from-bundled-result";
import { writeFileSync } from "fs";
import type { PageFiles } from "../../types";
import path from "path";

const {
    HYDRATION_DST_DIR,
    HYDRATION_DST_DIR_MAP_JSON_FILE,
    BUNX_HYDRATION_SRC_DIR,
} = grabDirNames();

let build_starts = 0;
const MAX_BUILD_STARTS = 10;

type Params = {
    post_build_fn?: (params: { artifacts: any[] }) => Promise<void> | void;
    // watch?: boolean;
};

export default async function allPagesESBuildContextBundler(params?: Params) {
    const pages = grabAllPages({ exclude_api: true });

    global.PAGE_FILES = pages;

    const dev = isDevelopment();

    const entryToPage = new Map<string, PageFiles>();

    for (const page of pages) {
        const txt = await grabClientHydrationScript({
            page_local_path: page.local_path,
        });
        if (!txt) continue;

        const entryFile = path.join(
            BUNX_HYDRATION_SRC_DIR,
            `${page.url_path}.tsx`,
        );
        await Bun.write(entryFile, txt, { createPath: true });
        entryToPage.set(path.resolve(entryFile), page);
    }

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
                    result,
                    entryToPage,
                });

                if (artifacts?.[0] && artifacts.length > 0) {
                    for (let i = 0; i < artifacts.length; i++) {
                        const artifact = artifacts[i];
                        if (artifact?.local_path && global.BUNDLER_CTX_MAP) {
                            global.BUNDLER_CTX_MAP[artifact.local_path] =
                                artifact;
                        }
                    }

                    params?.post_build_fn?.({ artifacts });

                    // writeFileSync(
                    //     HYDRATION_DST_DIR_MAP_JSON_FILE,
                    //     JSON.stringify(artifacts, null, 4),
                    // );
                }

                const elapsed = (performance.now() - buildStart).toFixed(0);
                log.success(`[Built] in ${elapsed}ms`);

                global.RECOMPILING = false;

                build_starts = 0;
            });
        },
    };

    const entryPoints = [...entryToPage.keys()];

    const ctx = await esbuild.context({
        entryPoints,
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
        entryNames: "[dir]/[hash]",
        metafile: true,
        plugins: [tailwindEsbuildPlugin, artifactTracker],
        jsx: "automatic",
        splitting: true,
        // logLevel: "silent",
        external: [
            "react",
            "react-dom",
            "react-dom/client",
            "react/jsx-runtime",
        ],
    });

    await ctx.rebuild();

    // if (params?.watch) {
    //     await ctx.watch();
    // }

    global.BUNDLER_CTX = ctx;
}
