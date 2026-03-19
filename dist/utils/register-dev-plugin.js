import { resolve, dirname, extname } from "path";
import { existsSync } from "fs";
const SOURCE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];
function getLoader(filePath) {
    const ext = extname(filePath).slice(1);
    return SOURCE_EXTENSIONS.map((e) => e.slice(1)).includes(ext) ? ext : "js";
}
function tryResolveSync(absPath) {
    if (existsSync(absPath))
        return absPath;
    for (const ext of SOURCE_EXTENSIONS) {
        const p = absPath + ext;
        if (existsSync(p))
            return p;
    }
    for (const ext of SOURCE_EXTENSIONS) {
        const p = resolve(absPath, "index" + ext);
        if (existsSync(p))
            return p;
    }
    return null;
}
export default function registerDevPlugin() {
    Bun.plugin({
        name: "bunext-dev-hmr",
        setup(build) {
            // Intercept absolute-path imports that already carry ?t= (our dynamic imports)
            build.onResolve({ filter: /\?t=\d+$/ }, (args) => {
                if (args.path.includes("node_modules"))
                    return undefined;
                const cleanPath = args.path.replace(/\?t=\d+$/, "");
                const resolved = tryResolveSync(cleanPath);
                if (!resolved)
                    return undefined;
                if (!SOURCE_EXTENSIONS.some((e) => resolved.endsWith(e)))
                    return undefined;
                return {
                    path: `${resolved}?t=${global.LAST_BUILD_TIME ?? 0}`,
                    namespace: "bunext-dev",
                };
            });
            // Intercept relative imports from within bunext-dev modules
            build.onResolve({ filter: /^\./ }, (args) => {
                if (!/\?t=\d+/.test(args.importer))
                    return undefined;
                // Strip "namespace:" prefix (e.g. "bunext-dev:") Bun prepends to importer
                const cleanImporter = args.importer
                    .replace(/^[^/]+:(?=\/)/, "")
                    .replace(/\?t=\d+$/, "");
                const base = resolve(dirname(cleanImporter), args.path);
                const resolved = tryResolveSync(base);
                if (!resolved)
                    return undefined;
                if (!SOURCE_EXTENSIONS.some((e) => resolved.endsWith(e)))
                    return undefined;
                return {
                    path: `${resolved}?t=${global.LAST_BUILD_TIME ?? 0}`,
                    namespace: "bunext-dev",
                };
            });
            // Load files in the bunext-dev namespace from disk (async is fine in onLoad)
            build.onLoad({ filter: /.*/, namespace: "bunext-dev" }, async (args) => {
                const realPath = args.path.replace(/\?t=\d+$/, "");
                const source = await Bun.file(realPath).text();
                return { contents: source, loader: getLoader(realPath) };
            });
        },
    });
}
