import path from "path";
import * as esbuild from "esbuild";
export default function grabArtifactsFromBundledResults({ result, pages, }) {
    if (result.errors.length > 0)
        return;
    const artifacts = Object.entries(result.metafile.outputs)
        .filter(([, meta]) => meta.entryPoint)
        .map(([outputPath, meta]) => {
        const target_page = pages.find((p) => {
            return meta.entryPoint === `virtual:${p.local_path}`;
        });
        if (!target_page || !meta.entryPoint) {
            return undefined;
        }
        const { file_name, local_path, url_path } = target_page;
        const cssPath = meta.cssBundle || undefined;
        return {
            path: outputPath,
            hash: path.basename(outputPath, path.extname(outputPath)),
            type: outputPath.endsWith(".css")
                ? "text/css"
                : "text/javascript",
            entrypoint: meta.entryPoint,
            css_path: cssPath,
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
