import { readFileSync, unlinkSync } from "fs";
import grabDirNames from "../../utils/grab-dir-names";
import grabCacheNames from "./grab-cache-names";
import path from "path";
import { AppData } from "../../data/app-data";
export default async function trimCacheKey({ key, }) {
    try {
        const { BUNEXT_CACHE_DIR } = grabDirNames();
        const { cache_name, cache_meta_name } = grabCacheNames({
            key,
        });
        const config = global.CONFIG;
        const default_expiry_time_seconds = config.default_cache_expiry ||
            AppData["DefaultCacheExpiryTimeSeconds"];
        const default_expiry_time_milliseconds = default_expiry_time_seconds * 1000;
        const cache_content_path = path.join(BUNEXT_CACHE_DIR, cache_name);
        const cache_meta_path = path.join(BUNEXT_CACHE_DIR, cache_meta_name);
        const cache_meta = JSON.parse(readFileSync(cache_meta_path, "utf-8"));
        const expiry_milliseconds = cache_meta.expiry_seconds
            ? cache_meta.expiry_seconds * 1000
            : default_expiry_time_milliseconds;
        if (Date.now() - cache_meta.date_created < expiry_milliseconds) {
            return {
                success: false,
                msg: `Cache has not expired yet`,
            };
        }
        unlinkSync(cache_content_path);
        unlinkSync(cache_meta_path);
        return {
            success: true,
        };
    }
    catch (error) {
        return {
            success: false,
            msg: `Trim cache key ERROR: ${error.message}`,
        };
    }
}
