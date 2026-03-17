import { existsSync, writeFileSync } from "fs";
import grabDirNames from "../../utils/grab-dir-names";
import grabCacheNames from "./grab-cache-names";
import type { APIResponseObject, BunextCacheFileMeta } from "../../types";
import path from "path";

type Params = {
    key: string;
    value: string;
    paradigm?: "html" | "json";
    expiry_seconds?: number;
};

export default async function writeCache({
    key,
    value,
    paradigm = "html",
    expiry_seconds,
}: Params): Promise<APIResponseObject> {
    try {
        const { BUNEXT_CACHE_DIR } = grabDirNames();

        const { cache_meta_name, cache_name } = grabCacheNames({
            key,
            paradigm,
        });

        const target_path = path.join(BUNEXT_CACHE_DIR, cache_name);

        if (existsSync(target_path)) {
            return {
                success: false,
                msg: `Cache entry already exists`,
            };
        }

        writeFileSync(path.join(target_path), value);

        const cache_file_meta: BunextCacheFileMeta = {
            date_created: Date.now(),
            paradigm,
        };

        if (expiry_seconds) {
            cache_file_meta.expiry_seconds = expiry_seconds;
        }

        writeFileSync(
            path.join(BUNEXT_CACHE_DIR, cache_meta_name),
            JSON.stringify(cache_file_meta),
        );

        return {
            success: true,
        };
    } catch (error: any) {
        return {
            success: false,
            msg: error.message,
        };
    }
}
