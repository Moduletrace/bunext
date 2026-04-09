import path from "path";
import * as esbuild from "esbuild";
import type { BundlerCTXMap, PageFiles } from "../../types";
import grabDirNames from "../../utils/grab-dir-names";
import { log } from "../../utils/log";
const { ROOT_DIR } = grabDirNames();

type Params = {
    result: esbuild.BuildResult<esbuild.BuildOptions>;
    entryToPage: Map<
        string,
        PageFiles & {
            tsx: string;
        }
    >;
    virtual_match?: string;
};

export default function grabArtifactsFromBundledResults({
    result,
    entryToPage,
    virtual_match = "hydration-virtual",
}: Params) {
    if (result.errors.length > 0) return;

    const virtual_regex = new RegExp(`^${virtual_match}:`);

    const artifacts: (BundlerCTXMap | undefined)[] = Object.entries(
        result.metafile!.outputs,
    )
        .filter(([, meta]) => meta.entryPoint)
        .map(([outputPath, meta]) => {
            const entrypoint = meta.entryPoint?.match(virtual_regex)
                ? meta.entryPoint?.replace(virtual_regex, "")
                : meta.entryPoint
                  ? path.join(ROOT_DIR, meta.entryPoint)
                  : "";

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
        const final_artifacts = artifacts.filter((a) =>
            Boolean(a?.entrypoint),
        ) as BundlerCTXMap[];

        return final_artifacts;
    }

    return undefined;
}
