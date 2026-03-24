import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import { log } from "../../utils/log";
import tailwindcss from "bun-plugin-tailwind";
import path from "path";
import grabClientHydrationScript from "./grab-client-hydration-script";
import { mkdirSync, rmSync } from "fs";
import recordArtifacts from "./record-artifacts";
import BunSkipNonBrowserPlugin from "./plugins/bun-skip-browser-plugin";
const { HYDRATION_DST_DIR, BUNX_HYDRATION_SRC_DIR, BUNX_TMP_DIR } = grabDirNames();
export default async function allPagesBunBundler(params) {
    const { target = "browser", page_file_paths } = params || {};
    const pages = grabAllPages({ exclude_api: true });
    const target_pages = page_file_paths?.[0]
        ? pages.filter((p) => page_file_paths.includes(p.local_path))
        : pages;
    if (!page_file_paths) {
        global.PAGE_FILES = pages;
        try {
            rmSync(BUNX_HYDRATION_SRC_DIR, { recursive: true });
        }
        catch { }
    }
    mkdirSync(BUNX_HYDRATION_SRC_DIR, { recursive: true });
    const dev = isDevelopment();
    const entryToPage = new Map();
    for (const page of target_pages) {
        const txt = await grabClientHydrationScript({
            page_local_path: page.local_path,
        });
        if (!txt)
            continue;
        const entryFile = path.join(BUNX_HYDRATION_SRC_DIR, `${page.url_path}.tsx`);
        await Bun.write(entryFile, txt, { createPath: true });
        entryToPage.set(path.resolve(entryFile), page);
    }
    if (entryToPage.size === 0)
        return;
    const buildStart = performance.now();
    const define = {
        "process.env.NODE_ENV": JSON.stringify(dev ? "development" : "production"),
    };
    const result = await Bun.build({
        entrypoints: [...entryToPage.keys()],
        outdir: HYDRATION_DST_DIR,
        root: BUNX_HYDRATION_SRC_DIR,
        minify: !dev,
        format: "esm",
        define,
        naming: {
            entry: "[dir]/[hash].[ext]",
            chunk: "chunks/[hash].[ext]",
        },
        plugins: [tailwindcss],
        // plugins: [tailwindcss, BunSkipNonBrowserPlugin],
        splitting: true,
        target,
        metafile: true,
        external: [
            "react",
            "react-dom",
            "react-dom/client",
            "react/jsx-runtime",
        ],
    });
    await Bun.write(path.join(BUNX_TMP_DIR, "bundle.json"), JSON.stringify(result, null, 4), { createPath: true });
    if (!result.success) {
        for (const entry of result.logs) {
            log.error(`[Build] ${entry.message}`);
        }
        return;
    }
    const artifacts = [];
    for (const [outputPath, outputInfo] of Object.entries(result.metafile.outputs)) {
        const entryPoint = outputInfo.entryPoint;
        const cssBundle = outputInfo.cssBundle;
        if (!entryPoint)
            continue;
        if (outputPath.match(/\.css$/))
            continue;
        const page = entryToPage.get(path.resolve(entryPoint));
        if (!page)
            continue;
        artifacts.push({
            path: path.join(".bunext/public/pages", outputPath),
            hash: path.basename(outputPath, path.extname(outputPath)),
            type: outputPath.endsWith(".css") ? "text/css" : "text/javascript",
            entrypoint: entryPoint,
            css_path: cssBundle
                ? path.join(".bunext/public/pages", cssBundle)
                : undefined,
            file_name: page.file_name,
            local_path: page.local_path,
            url_path: page.url_path,
        });
    }
    if (artifacts?.[0]) {
        await recordArtifacts({
            artifacts,
            page_file_paths,
        });
    }
    const elapsed = (performance.now() - buildStart).toFixed(0);
    log.success(`[Built] in ${elapsed}ms`);
    global.RECOMPILING = false;
    return artifacts;
}
