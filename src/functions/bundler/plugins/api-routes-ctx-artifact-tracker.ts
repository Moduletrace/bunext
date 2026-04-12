import { type Plugin } from "esbuild";
import type { BundlerCTXMap, PageFiles } from "../../../types";
import buildOnstartErrorHandler from "../build-on-start-error-handler";
import path from "path";
import grabDirNames from "../../../utils/grab-dir-names";
import { log } from "../../../utils/log";

let build_start = 0;
let build_starts = 0;
const MAX_BUILD_STARTS = 2;

const { ROOT_DIR } = grabDirNames();

type Params = {
    pages: PageFiles[];
};

export default function apiRoutesCTXArtifactTracker({ pages }: Params) {
    const artifactTracker: Plugin = {
        name: "ssr-artifact-tracker",
        setup(build) {
            build.onStart(async () => {
                build_starts++;
                build_start = performance.now();
                if (build_starts == MAX_BUILD_STARTS) {
                    await buildOnstartErrorHandler();
                }
            });

            build.onEnd((result) => {
                if (result.errors.length > 0) {
                    console.log("result.errors", result.errors);
                    return;
                }

                const artifacts: (BundlerCTXMap | undefined)[] = Object.entries(
                    result.metafile!.outputs,
                )
                    .filter(([, meta]) => meta.entryPoint)
                    .map(([outputPath, meta]) => {
                        const entrypoint = meta.entryPoint
                            ? path.join(ROOT_DIR, meta.entryPoint)
                            : undefined;

                        const target_page = pages.find(
                            (p) => p.local_path == entrypoint,
                        );

                        if (!target_page || !meta.entryPoint) {
                            return undefined;
                        }

                        const { file_name, local_path, url_path } = target_page;

                        return {
                            path: outputPath,
                            hash: path.basename(
                                outputPath,
                                path.extname(outputPath),
                            ),
                            type: "text/javascript",
                            entrypoint: meta.entryPoint,
                            file_name,
                            local_path,
                            url_path,
                        };
                    });

                // if (artifacts?.[0] && artifacts.length > 0) {
                //     for (let i = 0; i < artifacts.length; i++) {
                //         const artifact = artifacts[i];
                //         if (
                //             artifact?.local_path &&
                //             global.API_ROUTES_BUNDLER_CTX_MAP
                //         ) {
                //             global.API_ROUTES_BUNDLER_CTX_MAP[
                //                 artifact.local_path
                //             ] = artifact;
                //         }
                //     }
                // }

                const elapsed = (performance.now() - build_start).toFixed(0);
                log.success(`API Routes [Built] in ${elapsed}ms`);
            });
        },
    };

    return artifactTracker;
}
