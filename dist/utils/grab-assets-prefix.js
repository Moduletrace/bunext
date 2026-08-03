import AppNames from "./grab-app-names";
export default function grabAssetsPrefix() {
    if (global.BUNEXT_CONFIG.assets_prefix) {
        return global.BUNEXT_CONFIG.assets_prefix;
    }
    const { defaultAssetPrefix } = AppNames;
    return defaultAssetPrefix;
}
