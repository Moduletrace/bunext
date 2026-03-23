import { log } from "../../utils/log";
import path from "path";
import grabDirNames from "../../utils/grab-dir-names";
import { existsSync, readdirSync, statSync, unlinkSync } from "fs";
const { ROOT_DIR, HYDRATION_DST_DIR_MAP_JSON_FILE_NAME } = grabDirNames();
export default async function cleanupArtifacts({ new_artifacts }) {
    try {
        for (let i = 0; i < new_artifacts.length; i++) {
            const new_artifact = new_artifacts[i];
            const artifact_public_dir = path.dirname(path.join(ROOT_DIR, new_artifact.path));
            const dir_content = readdirSync(artifact_public_dir);
            for (let d = 0; d < dir_content.length; d++) {
                const dir_or_file = dir_content[d];
                const full_path = path.join(artifact_public_dir, dir_or_file);
                const file_or_path_stats = statSync(full_path);
                if (file_or_path_stats.isDirectory() ||
                    dir_or_file == HYDRATION_DST_DIR_MAP_JSON_FILE_NAME) {
                    continue;
                }
                if (new_artifact.path.includes(dir_or_file) ||
                    new_artifact.css_path?.includes(dir_or_file)) {
                    continue;
                }
                if (existsSync(full_path)) {
                    unlinkSync(full_path);
                }
            }
        }
    }
    catch (error) {
        log.error(error);
    }
}
