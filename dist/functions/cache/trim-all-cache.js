import { readdirSync } from "fs";
import grabDirNames from "../../utils/grab-dir-names";
import trimCacheKey from "./trim-cache-key";
export default async function trimAllCache() {
    try {
        const { BUNEXT_CACHE_DIR } = grabDirNames();
        const cached_items = readdirSync(BUNEXT_CACHE_DIR);
        for (let i = 0; i < cached_items.length; i++) {
            const cached_item = cached_items[i];
            if (!cached_item.endsWith(`.meta.json`))
                continue;
            const cache_key = decodeURIComponent(cached_item.replace(/\.meta\.json/, ""));
            const trim_key = await trimCacheKey({
                key: cache_key,
            });
            if (trim_key.success) {
                cached_items.splice(i, 1);
                i--;
            }
        }
    }
    catch (error) {
        return undefined;
    }
}
