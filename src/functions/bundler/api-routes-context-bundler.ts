import * as esbuild from "esbuild";
import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import tailwindEsbuildPlugin from "../server/web-pages/tailwind-esbuild-plugin";
import apiRoutesCTXArtifactTracker from "./plugins/api-routes-ctx-artifact-tracker";

const { BUNX_CWD_MODULE_CACHE_DIR } = grabDirNames();

export default async function apiRoutesContextBundler() {
    const pages = grabAllPages({ api_only: true });
    const dev = isDevelopment();

    // if (global.API_ROUTES_BUNDLER_CTX) {
    //     await global.API_ROUTES_BUNDLER_CTX.dispose();
    //     global.API_ROUTES_BUNDLER_CTX = undefined;
    // }

    // global.API_ROUTES_BUNDLER_CTX = await esbuild.context({
    //     entryPoints: pages.map((p) => p.local_path),
    //     outdir: BUNX_CWD_MODULE_CACHE_DIR,
    //     bundle: true,
    //     minify: !dev,
    //     format: "esm",
    //     target: "esnext",
    //     platform: "node",
    //     define: {
    //         "process.env.NODE_ENV": JSON.stringify(
    //             dev ? "development" : "production",
    //         ),
    //     },
    //     entryNames: "api/[dir]/[hash]",
    //     metafile: true,
    //     plugins: [
    //         tailwindEsbuildPlugin,
    //         apiRoutesCTXArtifactTracker({ pages }),
    //     ],
    //     jsx: "automatic",
    //     external: [
    //         "react",
    //         "react-dom",
    //         "react/jsx-runtime",
    //         "react/jsx-dev-runtime",
    //         "bun:*",
    //     ],
    // });

    // await global.API_ROUTES_BUNDLER_CTX.rebuild();
}
