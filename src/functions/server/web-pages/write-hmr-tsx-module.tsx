import * as esbuild from "esbuild";
import tailwindEsbuildPlugin from "./tailwind-esbuild-plugin";
import type { BundlerCTXMap } from "../../../types";
import path from "path";

type Params = {
    tsx: string;
    out_file: string;
};

export default async function writeHMRTsxModule({ tsx, out_file }: Params) {
    try {
        const build = await esbuild.build({
            stdin: {
                contents: tsx,
                resolveDir: process.cwd(),
                loader: "tsx",
            },
            bundle: true,
            format: "esm",
            target: "es2020",
            platform: "browser",
            external: [
                "react",
                "react-dom",
                "react/jsx-runtime",
                "react-dom/client",
            ],
            minify: true,
            jsx: "automatic",
            outfile: out_file,
            plugins: [tailwindEsbuildPlugin],
            metafile: true,
        });

        const artifacts: (
            | Pick<BundlerCTXMap, "path" | "hash" | "css_path" | "type">
            | undefined
        )[] = Object.entries(build.metafile!.outputs)
            .filter(([, meta]) => meta.entryPoint)
            .map(([outputPath, meta]) => {
                const cssPath = meta.cssBundle || undefined;

                return {
                    path: outputPath,
                    hash: path.basename(outputPath, path.extname(outputPath)),
                    type: outputPath.endsWith(".css")
                        ? "text/css"
                        : "text/javascript",
                    css_path: cssPath,
                };
            });

        return artifacts?.[0];
    } catch (error) {
        return undefined;
    }
}

// import * as esbuild from "esbuild";
// import path from "path";
// import tailwindEsbuildPlugin from "./tailwind-esbuild-plugin";

// const hmrExternalsPlugin: esbuild.Plugin = {
//     name: "hmr-globals",
//     setup(build) {
//         const mapping: Record<string, string> = {
//             react: "__REACT__",
//             "react-dom": "__REACT_DOM__",
//             "react-dom/client": "__REACT_DOM_CLIENT__",
//             "react/jsx-runtime": "__JSX_RUNTIME__",
//         };

//         const filter = new RegExp(
//             `^(${Object.keys(mapping)
//                 .map((k) => k.replace("/", "\\/"))
//                 .join("|")})$`,
//         );

//         build.onResolve({ filter }, (args) => {
//             return { path: args.path, namespace: "hmr-global" };
//         });

//         build.onLoad({ filter: /.*/, namespace: "hmr-global" }, (args) => {
//             const globalName = mapping[args.path];
//             return {
//                 contents: `module.exports = window.${globalName};`,
//                 loader: "js",
//             };
//         });
//     },
// };

// type Params = {
//     tsx: string;
//     file_path: string;
//     out_file: string;
// };

// export default async function writeHMRTsxModule({
//     tsx,
//     file_path,
//     out_file,
// }: Params) {
//     try {
//         await esbuild.build({
//             stdin: {
//                 contents: tsx,
//                 resolveDir: path.dirname(file_path),
//                 loader: "tsx",
//             },
//             bundle: true,
//             format: "esm",
//             target: "es2020",
//             platform: "browser",
//             minify: true,
//             jsx: "automatic",
//             outfile: out_file,
//             plugins: [hmrExternalsPlugin, tailwindEsbuildPlugin],
//         });

//         return true;
//     } catch (error) {
//         return false;
//     }
// }
