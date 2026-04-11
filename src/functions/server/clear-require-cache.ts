export default function clearRequireCache(modulePath: string) {
    const resolved = require.resolve(modulePath);
    const mod = require.cache[resolved];
    if (mod) {
        mod.children?.forEach((child) => {
            clearRequireCache(child.id);
        });
        delete require.cache[resolved];
    }
}
