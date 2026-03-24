import isDevelopment from "../../../utils/is-development";
import tailwindcss from "bun-plugin-tailwind";
import grabDirNames from "../../../utils/grab-dir-names";
import path from "path";
import BunSkipNonBrowserPlugin from "../../bundler/plugins/bun-skip-browser-plugin";

type Params = {
    tsx: string;
    file_path: string;
};

export default async function grabTsxStringModule<T extends any = any>({
    tsx,
    file_path,
}: Params): Promise<T> {
    const dev = isDevelopment();
    const { BUNX_CWD_MODULE_CACHE_DIR } = grabDirNames();

    const trimmed_file_path = file_path
        .replace(/.*\/src\/pages\//, "")
        .replace(/\.tsx$/, "");

    const src_file_path = path.join(
        BUNX_CWD_MODULE_CACHE_DIR,
        `${trimmed_file_path}.tsx`,
    );

    const out_file_path = path.join(
        BUNX_CWD_MODULE_CACHE_DIR,
        `${trimmed_file_path}.js`,
    );

    await Bun.write(src_file_path, tsx);

    const build = await Bun.build({
        entrypoints: [src_file_path],
        format: "esm",
        target: "bun",
        external: ["react", "react-dom"],
        minify: true,
        define: {
            "process.env.NODE_ENV": JSON.stringify(
                dev ? "development" : "production",
            ),
        },
        metafile: true,
        plugins: [tailwindcss, BunSkipNonBrowserPlugin],
        jsx: {
            runtime: "automatic",
            development: dev,
        },
        outdir: BUNX_CWD_MODULE_CACHE_DIR,
    });

    Loader.registry.delete(out_file_path);
    const module = await import(`${out_file_path}?t=${Date.now()}`);

    return module as T;
}

// await esbuild.build({
//     stdin: {
//         contents: tsx,
//         resolveDir: process.cwd(),
//         loader: "tsx",
//     },
//     bundle: true,
//     format: "esm",
//     target: "es2020",
//     platform: "node",
//     external: ["react", "react-dom"],
//     minify: true,
//     define: {
//         "process.env.NODE_ENV": JSON.stringify(
//             dev ? "development" : "production",
//         ),
//     },
//     metafile: true,
//     plugins: [tailwindEsbuildPlugin],
//     jsx: "automatic",
//     write: true,
//     outfile: out_file_path,
// });
