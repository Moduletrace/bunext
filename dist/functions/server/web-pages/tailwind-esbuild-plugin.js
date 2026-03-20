import * as esbuild from "esbuild";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { readFile } from "fs/promises";
const tailwindEsbuildPlugin = {
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
export default tailwindEsbuildPlugin;
