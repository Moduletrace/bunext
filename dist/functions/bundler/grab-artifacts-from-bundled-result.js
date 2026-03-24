import path from "path";
import * as esbuild from "esbuild";
import grabDirNames from "../../utils/grab-dir-names";
import { log } from "../../utils/log";
const { ROOT_DIR } = grabDirNames();
export default function grabArtifactsFromBundledResults({ result, entryToPage, }) {
    if (result.errors.length > 0)
        return;
    const artifacts = Object.entries(result.metafile.outputs)
        .filter(([, meta]) => meta.entryPoint)
        .map(([outputPath, meta]) => {
        const entrypoint = meta.entryPoint?.match(/^hydration-virtual:/)
            ? meta.entryPoint?.replace(/^hydration-virtual:/, "")
            : meta.entryPoint
                ? path.join(ROOT_DIR, meta.entryPoint)
                : "";
        // const entrypoint = path.join(ROOT_DIR, meta.entryPoint || "");
        // console.log("entrypoint", entrypoint);
        const target_page = entryToPage.get(entrypoint);
        if (!target_page || !meta.entryPoint) {
            return undefined;
        }
        const { file_name, local_path, url_path } = target_page;
        return {
            path: outputPath,
            hash: path.basename(outputPath, path.extname(outputPath)),
            type: outputPath.endsWith(".css")
                ? "text/css"
                : "text/javascript",
            entrypoint: meta.entryPoint,
            css_path: meta.cssBundle,
            file_name,
            local_path,
            url_path,
        };
    });
    if (artifacts.length > 0) {
        const final_artifacts = artifacts.filter((a) => Boolean(a?.entrypoint));
        return final_artifacts;
    }
    return undefined;
}
