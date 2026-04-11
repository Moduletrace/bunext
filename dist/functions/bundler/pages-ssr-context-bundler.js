import * as esbuild from "esbuild";
import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import tailwindEsbuildPlugin from "../server/web-pages/tailwind-esbuild-plugin";
import grabPageReactComponentString from "../server/web-pages/grab-page-react-component-string";
import grabRootFilePath from "../server/web-pages/grab-root-file-path";
import ssrVirtualFilesPlugin from "./plugins/ssr-virtual-files-plugin";
import ssrCTXArtifactTracker from "./plugins/ssr-ctx-artifact-tracker";
const { BUNX_CWD_MODULE_CACHE_DIR } = grabDirNames();
export default async function pagesSSRContextBundler(params) {
    const pages = grabAllPages();
    const dev = isDevelopment();
    if (global.SSR_BUNDLER_CTX) {
        await global.SSR_BUNDLER_CTX.dispose();
        global.SSR_BUNDLER_CTX = undefined;
    }
    const entryToPage = new Map();
    const { root_file_path } = grabRootFilePath();
    for (const page of pages) {
        if (page.local_path.match(/\/pages\/api\//)) {
            const ts = await Bun.file(page.local_path).text();
            entryToPage.set(page.local_path, { ...page, tsx: ts });
            continue;
        }
        const tsx = grabPageReactComponentString({
            file_path: page.local_path,
            root_file_path,
        });
        if (!tsx)
            continue;
        entryToPage.set(page.local_path, { ...page, tsx });
    }
    const entryPoints = [...entryToPage.keys()].map((e) => `ssr-virtual:${e}`);
    global.SSR_BUNDLER_CTX = await esbuild.context({
        entryPoints,
        outdir: BUNX_CWD_MODULE_CACHE_DIR,
        bundle: true,
        minify: !dev,
        format: "esm",
        target: "es2020",
        platform: "node",
        define: {
            "process.env.NODE_ENV": JSON.stringify(dev ? "development" : "production"),
        },
        entryNames: "[dir]/[hash]",
        metafile: true,
        plugins: [
            tailwindEsbuildPlugin,
            ssrVirtualFilesPlugin({
                entryToPage,
            }),
            ssrCTXArtifactTracker({
                entryToPage,
                post_build_fn: params?.post_build_fn,
            }),
        ],
        jsx: "automatic",
        external: [
            "react",
            "react-dom",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
        ],
        // logLevel: "silent",
    });
    await global.SSR_BUNDLER_CTX.rebuild();
}
