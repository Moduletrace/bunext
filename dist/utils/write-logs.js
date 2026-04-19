import { writeFileSync } from "fs";
import grabDirNames from "./grab-dir-names";
import path from "path";
const { BUNX_LOGS_DIR } = grabDirNames();
export default function writeLogs(log) {
    try {
        const now = Date.now();
        let new_log_name = `${now}`;
        let log_content = log.toString();
        try {
            const json = JSON.stringify(log, null, 4);
            new_log_name += `.json`;
            log_content = json;
        }
        catch (error) {
            new_log_name += `.log`;
        }
        const log_path = path.join(BUNX_LOGS_DIR, new_log_name);
        writeFileSync(log_path, log_content);
    }
    catch (error) { }
}
