import path from "path";
export default function grabDirNames() {
    const ROOT_DIR = process.cwd();
    const SRC_DIR = path.join(ROOT_DIR, "src");
    const PAGES_DIR = path.join(SRC_DIR, "pages");
    const API_DIR = path.join(PAGES_DIR, "api");
    const PUBLIC_DIR = path.join(ROOT_DIR, "public");
    const CONFIG_FILE = path.join(ROOT_DIR, "bunext.config.ts");
    const BUNX_CWD_DIR = path.resolve(ROOT_DIR, ".bunext");
    const BUNX_CWD_MODULE_CACHE_DIR = path.resolve(BUNX_CWD_DIR, "module-cache");
    const BUNX_CWD_PAGES_REWRITE_DIR = path.resolve(BUNX_CWD_DIR, "pages");
    const BUNX_TMP_DIR = path.resolve(BUNX_CWD_DIR, ".tmp");
    const BUNX_HYDRATION_SRC_DIR = path.resolve(BUNX_CWD_DIR, "client", "hydration-src");
    const BUNEXT_PUBLIC_DIR = path.join(BUNX_CWD_DIR, "public");
    const HYDRATION_DST_DIR = path.join(BUNEXT_PUBLIC_DIR, "pages");
    const BUNEXT_CACHE_DIR = path.join(BUNEXT_PUBLIC_DIR, "cache");
    const HYDRATION_DST_DIR_MAP_JSON_FILE_NAME = "map.json";
    const HYDRATION_DST_DIR_MAP_JSON_FILE = path.join(HYDRATION_DST_DIR, HYDRATION_DST_DIR_MAP_JSON_FILE_NAME);
    const BUNX_ROOT_DIR = path.resolve(__dirname, "../../");
    const BUNX_ROOT_SRC_DIR = path.join(BUNX_ROOT_DIR, "src");
    const BUNX_ROOT_PRESETS_DIR = path.join(BUNX_ROOT_SRC_DIR, "presets");
    const BUNX_ROOT_500_FILE_NAME = `server-error`;
    const BUNX_ROOT_500_PRESET_COMPONENT = path.join(BUNX_ROOT_PRESETS_DIR, `${BUNX_ROOT_500_FILE_NAME}.tsx`);
    const BUNX_ROOT_404_FILE_NAME = `not-found`;
    const BUNX_ROOT_404_PRESET_COMPONENT = path.join(BUNX_ROOT_PRESETS_DIR, `${BUNX_ROOT_404_FILE_NAME}.tsx`);
    return {
        ROOT_DIR,
        SRC_DIR,
        PAGES_DIR,
        API_DIR,
        PUBLIC_DIR,
        HYDRATION_DST_DIR,
        BUNX_CWD_DIR,
        BUNX_ROOT_DIR,
        CONFIG_FILE,
        BUNX_TMP_DIR,
        BUNX_HYDRATION_SRC_DIR,
        BUNX_ROOT_SRC_DIR,
        BUNX_ROOT_PRESETS_DIR,
        BUNX_ROOT_500_PRESET_COMPONENT,
        BUNX_ROOT_500_FILE_NAME,
        BUNX_ROOT_404_PRESET_COMPONENT,
        BUNX_ROOT_404_FILE_NAME,
        HYDRATION_DST_DIR_MAP_JSON_FILE,
        BUNEXT_CACHE_DIR,
        BUNX_CWD_MODULE_CACHE_DIR,
        BUNX_CWD_PAGES_REWRITE_DIR,
        HYDRATION_DST_DIR_MAP_JSON_FILE_NAME,
    };
}
