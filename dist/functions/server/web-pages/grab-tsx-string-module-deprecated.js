import isDevelopment from "../../../utils/is-development";
import * as esbuild from "esbuild";
export default async function grabTsxStringModule({ tsx, }) {
    const dev = isDevelopment();
    const now = Date.now();
    const final_tsx = dev ? tsx + `\n// v_${now}` : tsx;
    const result = await esbuild.transform(final_tsx, {
        loader: "tsx",
        format: "esm",
        jsx: "automatic",
        minify: !dev,
    });
    const blob = new Blob([result.code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const mod = await import(url);
    URL.revokeObjectURL(url);
    return mod;
}
// export default async function grabTsxStringModule<T extends any = any>({
//     tsx,
// }: Params): Promise<T> {
//     const dev = isDevelopment();
//     const now = Date.now();
//     const { BUNX_CWD_MODULE_CACHE_DIR } = grabDirNames();
//     const target_cache_file_path = path.join(
//         BUNX_CWD_MODULE_CACHE_DIR,
//         `server-render-${now}.js`,
//     );
//     await esbuild.build({
//         stdin: {
//             contents: dev ? tsx + `\n// v_${now}` : tsx,
//             resolveDir: process.cwd(),
//             loader: "tsx",
//         },
//         bundle: true,
//         format: "esm",
//         target: "es2020",
//         platform: "node",
//         external: [
//             "react",
//             "react-dom",
//             "react/jsx-runtime",
//             "react/jsx-dev-runtime",
//         ],
//         minify: !dev,
//         define: {
//             "process.env.NODE_ENV": JSON.stringify(
//                 dev ? "development" : "production",
//             ),
//         },
//         jsx: "automatic",
//         outfile: target_cache_file_path,
//         plugins: [tailwindEsbuildPlugin],
//     });
//     Loader.registry.delete(target_cache_file_path);
//     const mod = await import(`${target_cache_file_path}?t=${now}`);
//     return mod as T;
// }
// if (!dev) {
//     const now = Date.now();
//     const final_tsx = dev ? tsx + `\n// v_${now}` : tsx;
//     const result = await esbuild.transform(final_tsx, {
//         loader: "tsx",
//         format: "esm",
//         jsx: "automatic",
//         minify: !dev,
//     });
//     const blob = new Blob([result.code], { type: "text/javascript" });
//     const url = URL.createObjectURL(blob);
//     const mod = await import(url);
//     URL.revokeObjectURL(url);
//     return mod as T;
// }
