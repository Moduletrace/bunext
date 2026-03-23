const BunSkipNonBrowserPlugin = {
    name: "skip-non-browser",
    setup(build) {
        build.onResolve({ filter: /^(bun:|node:)/ }, (args) => {
            return { path: args.path, external: true };
        });
        build.onResolve({ filter: /^[^./]/ }, (args) => {
            // If it's a built-in like 'fs' or 'path', skip it immediately
            const excludes = [
                "fs",
                "path",
                "os",
                "crypto",
                "net",
                "events",
                "util",
            ];
            if (excludes.includes(args.path) || args.path.startsWith("node:")) {
                return { path: args.path, external: true };
            }
            try {
                Bun.resolveSync(args.path, args.importer || process.cwd());
                return null;
            }
            catch (e) {
                console.warn(`[Skip] Mark as external: ${args.path}`);
                return { path: args.path, external: true };
            }
        });
    },
};
export default BunSkipNonBrowserPlugin;
