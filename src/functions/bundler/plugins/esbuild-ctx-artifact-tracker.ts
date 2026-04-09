import type { Plugin } from "esbuild";
import type { PageFiles } from "../../../types";
import { log } from "../../../utils/log";
import grabArtifactsFromBundledResults from "../grab-artifacts-from-bundled-result";

let buildStart = 0;
let build_starts = 0;
const MAX_BUILD_STARTS = 10;

type Params = {
    entryToPage: Map<
        string,
        PageFiles & {
            tsx: string;
        }
    >;
    post_build_fn?: (params: { artifacts: any[] }) => Promise<void> | void;
};

export default function esbuildCTXArtifactTracker({
    entryToPage,
    post_build_fn,
}: Params) {
    const artifactTracker: Plugin = {
        name: "artifact-tracker",
        setup(build) {
            build.onStart(() => {
                build_starts++;
                buildStart = performance.now();

                if (build_starts == MAX_BUILD_STARTS) {
                    const error_msg = `Build Failed. Please check all your components and imports.`;
                    log.error(error_msg);
                    global.RECOMPILING = false;
                    global.IS_SERVER_COMPONENT = false;
                }
            });

            build.onEnd((result) => {
                if (result.errors.length > 0) {
                    // for (const error of result.errors) {
                    //     const loc = error.location;
                    //     const location = loc
                    //         ? ` ${loc.file}:${loc.line}:${loc.column}`
                    //         : "";
                    //     log.error(`[Build]${location} ${error.text}`);
                    // }
                    return;
                }

                const artifacts = grabArtifactsFromBundledResults({
                    result,
                    entryToPage,
                });

                // console.log("artifacts", artifacts);

                if (artifacts?.[0] && artifacts.length > 0) {
                    for (let i = 0; i < artifacts.length; i++) {
                        const artifact = artifacts[i];
                        if (artifact?.local_path && global.BUNDLER_CTX_MAP) {
                            global.BUNDLER_CTX_MAP[artifact.local_path] =
                                artifact;
                        }
                    }

                    post_build_fn?.({ artifacts });

                    // writeFileSync(
                    //     HYDRATION_DST_DIR_MAP_JSON_FILE,
                    //     JSON.stringify(artifacts, null, 4),
                    // );
                }

                const elapsed = (performance.now() - buildStart).toFixed(0);
                log.success(`[Built] in ${elapsed}ms`);

                global.RECOMPILING = false;
                global.IS_SERVER_COMPONENT = false;

                build_starts = 0;
            });
        },
    };

    return artifactTracker;
}
