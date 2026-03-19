import isDevelopment from "../../../utils/is-development";
import * as esbuild from "esbuild";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { readFile } from "fs/promises";
import grabDirNames from "../../../utils/grab-dir-names";
import path from "path";
import { execSync } from "child_process";

type Params = {
    tsx: string;
    file_path: string;
};

const tailwindPlugin: esbuild.Plugin = {
    name: "tailwindcss",
    setup(build) {
        build.onLoad({ filter: /\.css$/ }, async (args) => {
            const source = await readFile(args.path, "utf-8");
            const result = await postcss([tailwindcss()]).process(source, {
                from: args.path,
            });

            return {
                contents: result.css,
                loader: "css",
            };
        });
    },
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

    const out_file_path = path.join(
        BUNX_CWD_MODULE_CACHE_DIR,
        `${trimmed_file_path}.js`,
    );

    await esbuild.build({
        stdin: {
            contents: tsx,
            resolveDir: process.cwd(),
            loader: "tsx",
        },
        bundle: true,
        format: "esm",
        target: "es2020",
        platform: "node",
        external: ["react", "react-dom"],
        minify: true,
        define: {
            "process.env.NODE_ENV": JSON.stringify(
                dev ? "development" : "production",
            ),
        },
        metafile: true,
        plugins: [tailwindPlugin],
        jsx: "automatic",
        write: true,
        outfile: out_file_path,
    });

    Loader.registry.delete(out_file_path);
    const module = await import(`${out_file_path}?t=${Date.now()}`);

    return module as T;
}
