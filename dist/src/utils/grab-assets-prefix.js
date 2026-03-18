import AppNames from "./grab-app-names";
export default function grabAssetsPrefix() {
    if (global.CONFIG.assetsPrefix) {
        return global.CONFIG.assetsPrefix;
    }
    const { defaultAssetPrefix } = AppNames;
    return defaultAssetPrefix;
}
