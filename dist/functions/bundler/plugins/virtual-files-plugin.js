import path from "path";
import { log } from "../../../utils/log";
export default function virtualFilesPlugin({ entryToPage }) {
    const virtualPlugin = {
        name: "virtual-hydration",
        setup(build) {
            build.onResolve({ filter: /^hydration-virtual:/ }, (args) => {
                const final_path = args.path.replace(/hydration-virtual:/, "");
                return {
                    path: final_path,
                    namespace: "hydration-virtual",
                };
            });
            build.onLoad({ filter: /.*/, namespace: "hydration-virtual" }, (args) => {
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
