import path from "path";
import { log } from "../../../utils/log";
export default function ssrVirtualFilesPlugin({ entryToPage }) {
    const virtualPlugin = {
        name: "ssr-virtual-hydration",
        setup(build) {
            build.onResolve({ filter: /^ssr-virtual:/ }, (args) => {
                const final_path = args.path.replace(/ssr-virtual:/, "");
                return {
                    path: final_path,
                    namespace: "ssr-virtual",
                };
            });
            build.onLoad({ filter: /.*/, namespace: "ssr-virtual" }, (args) => {
                const target = entryToPage.get(args.path);
                if (!target?.tsx)
                    return null;
                const contents = target.tsx;
                return {
                    contents: contents || "",
                    loader: "tsx",
                    resolveDir: path.dirname(target.local_path),
                };
            });
        },
    };
    return virtualPlugin;
}
