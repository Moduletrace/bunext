import * as esbuild from "esbuild";
import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import tailwindEsbuildPlugin from "../server/web-pages/tailwind-esbuild-plugin";
import grabClientHydrationScript from "./grab-client-hydration-script";
import type { BundlerCTXMap, PageFiles } from "../../types";
import path from "path";
import virtualFilesPlugin from "./plugins/virtual-files-plugin";
import esbuildCTXArtifactTracker from "./plugins/esbuild-ctx-artifact-tracker";
import { existsSync } from "fs";

const {
    HYDRATION_DST_DIR,
    BUNX_HYDRATION_SRC_DIR,
    BUNX_BUNDLER_ERROR_EXIT_FILE,
} = grabDirNames();

type Params = {
    post_build_fn?: (params: {
        artifacts: BundlerCTXMap[];
    }) => Promise<void> | void;
};

export default async function allPagesESBuildContextBundler(params?: Params) {
    try {
        const did_process_exit_because_of_bundler_error = existsSync(
            BUNX_BUNDLER_ERROR_EXIT_FILE,
        );

        const pages = grabAllPages({ exclude_api: true });

        global.PAGE_FILES = pages;

        const dev = isDevelopment();

        const entryToPage = new Map<string, PageFiles & { tsx: string }>();

        for (const page of pages) {
            const tsx = await grabClientHydrationScript({
                page_local_path: page.local_path,
            });

            if (!tsx) {
                continue;
            }

            const entryFile = path.join(
                BUNX_HYDRATION_SRC_DIR,
                `${page.url_path}.tsx`,
            );

            // await Bun.write(entryFile, txt, { createPath: true });
            entryToPage.set(entryFile, { ...page, tsx });
        }

        const entryPoints = [...entryToPage.keys()].map(
            (e) => `hydration-virtual:${e}`,
        );

        global.BUNDLER_CTX = await esbuild.context({
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
            plugins: [
                forceExternalReact(),
                tailwindEsbuildPlugin,
                virtualFilesPlugin({
                    entryToPage,
                }),
                esbuildCTXArtifactTracker({
                    entryToPage,
                    post_build_fn: params?.post_build_fn,
                }),
            ],
            jsx: "automatic",
            splitting: true,
            treeShaking: true,
            external: [
                "react",
                "react-dom",
                "react-dom/client",
                "react/jsx-runtime",
                "react/jsx-dev-runtime",
                ...(global.CONFIG.page_compiler_excludes || []),
            ],
            logLevel: did_process_exit_because_of_bundler_error
                ? "silent"
                : undefined,
        });

        await global.BUNDLER_CTX.rebuild();
    } catch (error) {
        console.log(`ESBUILD Error =>`, error);
    }
}

function forceExternalReact(): esbuild.Plugin {
    return {
        name: "force-external-react",
        setup(build) {
            build.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, (args) => {
                if (args.pluginData?.externalReact) return null;
                return {
                    path: args.path,
                    external: true,
                };
            });
        },
    };
}
