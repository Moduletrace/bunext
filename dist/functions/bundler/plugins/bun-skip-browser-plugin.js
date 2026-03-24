import { log } from "../../../utils/log";
const BunSkipNonBrowserPlugin = {
    name: "skip-non-browser",
    setup(build) {
        const skipFilter = /^(bun:|node:|fs$|path$|os$|crypto$|net$|events$|util$|tls$|url$|process$)/;
        // const skipped_modules = new Set<string>();
        build.onResolve({ filter: skipFilter }, (args) => {
            global.SKIPPED_BROWSER_MODULES.add(args.path);
            return {
                path: args.path,
                namespace: "skipped",
                // external: true,
            };
        });
        // build.onEnd(() => {
        //     log.warn(`global.SKIPPED_BROWSER_MODULES`, [
        //         ...global.SKIPPED_BROWSER_MODULES,
        //     ]);
        // });
        // build.onResolve({ filter: /^[^./]/ }, (args) => {
        //     // If it's a built-in like 'fs' or 'path', skip it immediately
        //     const excludes = [
        //         "fs",
        //         "path",
        //         "os",
        //         "crypto",
        //         "net",
        //         "events",
        //         "util",
        //         "tls",
        //     ];
        //     if (excludes.includes(args.path) || args.path.startsWith("node:")) {
        //         return {
        //             path: args.path,
        //             // namespace: "skipped",
        //             external: true,
        //         };
        //     }
        //     try {
        //         Bun.resolveSync(args.path, args.importer || process.cwd());
        //         return null;
        //     } catch (e) {
        //         console.warn(`[Skip] Mark as external: ${args.path}`);
        //         return {
        //             path: args.path,
        //             // namespace: "skipped",
        //             external: true,
        //         };
        //     }
        // });
        build.onLoad({ filter: /.*/, namespace: "skipped" }, (args) => {
            return {
                contents: `
                    const proxy = new Proxy(() => proxy, {
                        get: () => proxy,
                        construct: () => proxy,
                    });

                    export const Database = proxy;
                    export const join = proxy;
                    export const fileURLToPath = proxy;
                    export const arch = proxy;
                    export const platform = proxy;
                    export const statSync = proxy;
                    
                    export const $H = proxy; 
                    export const _ = proxy;

                    export default proxy;
                `,
                loader: "js",
            };
        });
    },
};
export default BunSkipNonBrowserPlugin;
