import isDevelopment from "../../../utils/is-development";
import * as esbuild from "esbuild";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { readFile } from "fs/promises";
import grabDirNames from "../../../utils/grab-dir-names";
import path from "path";
import tailwindEsbuildPlugin from "./tailwind-esbuild-plugin";
export default async function grabFilePathModule({ file_path, out_file, }) {
    const dev = isDevelopment();
    const { BUNX_CWD_MODULE_CACHE_DIR } = grabDirNames();
    const target_cache_file_path = out_file ||
        path.join(BUNX_CWD_MODULE_CACHE_DIR, `${path.basename(file_path)}.js`);
    await esbuild.build({
        entryPoints: [file_path],
        bundle: true,
        format: "esm",
        target: "es2020",
        platform: "node",
        external: ["react", "react-dom"],
        minify: true,
        define: {
            "process.env.NODE_ENV": JSON.stringify(dev ? "development" : "production"),
        },
        metafile: true,
        plugins: [tailwindEsbuildPlugin],
        jsx: "automatic",
        outfile: target_cache_file_path,
    });
    Loader.registry.delete(target_cache_file_path);
    const module = await import(`${target_cache_file_path}?t=${Date.now()}`);
    return module;
}
