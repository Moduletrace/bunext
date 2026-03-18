import { readFileSync } from "fs";
import grabDirNames from "../../utils/grab-dir-names";
import grabCacheNames from "./grab-cache-names";
import path from "path";
export default function getCache({ key, paradigm }) {
    try {
        const { BUNEXT_CACHE_DIR } = grabDirNames();
        const { cache_name } = grabCacheNames({ key, paradigm });
        const content = readFileSync(path.join(BUNEXT_CACHE_DIR, cache_name), "utf-8");
        return content;
    }
    catch (error) {
        return undefined;
    }
}
