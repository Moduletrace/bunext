import type { Plugin } from "esbuild";
import path from "path";
import grabDirNames from "../../../utils/grab-dir-names";

const { ROOT_DIR } = grabDirNames();

const reactAliasPlugin: Plugin = {
    name: "react-alias",
    setup(build) {
        const reactPath = path.join(ROOT_DIR, "node_modules");

        build.onResolve({ filter: /^react$/ }, () => ({
            path: path.join(reactPath, "react", "index.js"),
        }));

        build.onResolve({ filter: /^react-dom$/ }, () => ({
            path: path.join(reactPath, "react-dom", "index.js"),
        }));

        build.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({
            path: path.join(reactPath, "react", "jsx-runtime.js"),
        }));

        build.onResolve({ filter: /^react\/jsx-dev-runtime$/ }, () => ({
            path: path.join(reactPath, "react", "jsx-dev-runtime.js"),
        }));
    },
};

export default reactAliasPlugin;
