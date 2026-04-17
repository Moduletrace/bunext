import path from "path";
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "fs";
import grabDirNames from "../utils/grab-dir-names";
import grabConstants from "../utils/grab-constants";
import { AppData } from "../data/app-data";
const { BUNX_LOGS_DIR } = grabDirNames();
export default function cleanupLogsDirs() {
    const logs_dirs = readdirSync(BUNX_LOGS_DIR);
    const { config } = grabConstants();
    const MAX_LOGS = config.max_logs || AppData["DefaultMaxLogs"];
    for (let i = 0; i < logs_dirs.length; i++) {
        const dir = logs_dirs[i];
        const full_path = path.join(BUNX_LOGS_DIR, dir);
        const path_stats = statSync(full_path);
        if (!path_stats.isDirectory()) {
            continue;
        }
        const sub_dir_files = readdirSync(full_path).sort((a, b) => {
            const timestamp_a = Number(a.split(".")[0]);
            const timestamp_b = Number(b.split(".")[0]);
            if (timestamp_a > timestamp_b)
                return 1;
            return -1;
        });
        for (let j = 0; j < sub_dir_files.length; j++) {
            const sub_dir_file = sub_dir_files[j];
            const sub_dir_file_full_path = path.join(full_path, sub_dir_file);
            const sub_dir_file_Stats = statSync(sub_dir_file_full_path);
            if (!sub_dir_file_Stats.isFile()) {
                rmSync(sub_dir_file_full_path, {
                    force: true,
                    recursive: true,
                });
                continue;
            }
            if (j > MAX_LOGS - 1) {
                rmSync(sub_dir_file_full_path, { force: true });
            }
        }
    }
}
// log.info("Running development server ...");
// try {
//     rmSync(HYDRATION_DST_DIR, { recursive: true });
//     rmSync(BUNX_CWD_PAGES_REWRITE_DIR, { recursive: true });
// } catch (error) {}
// await bunextInit();
// await startServer();
