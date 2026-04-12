import AppNames from "./grab-app-names";

export default function grabAssetsPrefix() {
    if (global.CONFIG.assets_prefix) {
        return global.CONFIG.assets_prefix;
    }

    const { defaultAssetPrefix } = AppNames;

    return defaultAssetPrefix;
}
