import * as esbuild from "esbuild";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import grabDirNames from "../../../utils/grab-dir-names";
import { log } from "../../../utils/log";
const { ROOT_DIR } = grabDirNames();
let error_logged = false;
const tailwindEsbuildPlugin = {
    name: "tailwindcss",
    setup(build) {
        build.onLoad({ filter: /\.css$/ }, async (args) => {
            try {
                const source = await readFile(args.path, "utf-8");
                const result = await postcss([tailwindcss()]).process(source, {
                    from: args.path,
                });
                error_logged = false;
                return { contents: result.css, loader: "css" };
            }
            catch (error) {
                return { errors: [{ text: error.message }] };
            }
        });
        build.onResolve({ filter: /\.css$/ }, async (args) => {
            const css_path = path.resolve(args.resolveDir, args.path.replace(/\@\//g, ROOT_DIR + "/"));
            const does_path_exist = existsSync(css_path);
            if (!does_path_exist && !error_logged) {
                const err_msg = `CSS Error: ${css_path} file does not exist.`;
                log.error(err_msg);
                error_logged = true;
                // return {
                //     errors: [
                //         {
                //             text: err_msg,
                //         },
                //     ],
                //     pluginName: "tailwindcss",
                // };
            }
            return {
                path: css_path,
            };
        });
    },
};
export default tailwindEsbuildPlugin;
