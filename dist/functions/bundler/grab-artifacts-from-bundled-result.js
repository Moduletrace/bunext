import path from "path";
import * as esbuild from "esbuild";
import grabDirNames from "../../utils/grab-dir-names";
const { ROOT_DIR } = grabDirNames();
export default function grabArtifactsFromBundledResults({ result, entryToPage, }) {
    if (result.errors.length > 0)
        return;
    const artifacts = Object.entries(result.metafile.outputs)
        .filter(([, meta]) => meta.entryPoint)
        .map(([outputPath, meta]) => {
        const entrypoint = path.join(ROOT_DIR, meta.entryPoint || "");
        const target_page = entryToPage.get(entrypoint);
        if (!target_page || !meta.entryPoint) {
            return undefined;
        }
        const { file_name, local_path, url_path, transformed_path } = target_page;
        return {
            path: outputPath,
            hash: path.basename(outputPath, path.extname(outputPath)),
            type: outputPath.endsWith(".css")
                ? "text/css"
                : "text/javascript",
            entrypoint,
            css_path: meta.cssBundle,
            file_name,
            local_path,
            url_path,
            transformed_path,
        };
    });
    if (artifacts.length > 0) {
        const final_artifacts = artifacts.filter((a) => Boolean(a?.entrypoint));
        return final_artifacts;
    }
    return undefined;
}
