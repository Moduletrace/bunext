import {} from "esbuild";
import { log } from "../../../utils/log";
import grabArtifactsFromBundledResults from "../grab-artifacts-from-bundled-result";
let buildStart = 0;
let build_starts = 0;
const MAX_BUILD_STARTS = 2;
export default function ssrCTXArtifactTracker({ entryToPage, post_build_fn, }) {
    const artifactTracker = {
        name: "ssr-artifact-tracker",
        setup(build) {
            build.onStart(async () => {
                build_starts++;
                buildStart = performance.now();
                if (build_starts == MAX_BUILD_STARTS) {
                    // const error_msg = `SSR Build Failed. Please check all your components and imports.`;
                    // log.error(error_msg);
                }
            });
            build.onEnd((result) => {
                if (result.errors.length > 0) {
                    return;
                }
                const artifacts = grabArtifactsFromBundledResults({
                    result,
                    entryToPage,
                    virtual_match: `ssr-virtual`,
                });
                if (artifacts?.[0] && artifacts.length > 0) {
                    for (let i = 0; i < artifacts.length; i++) {
                        const artifact = artifacts[i];
                        if (artifact?.local_path &&
                            global.SSR_BUNDLER_CTX_MAP) {
                            global.SSR_BUNDLER_CTX_MAP[artifact.local_path] =
                                artifact;
                        }
                    }
                    post_build_fn?.({ artifacts });
                }
            });
        },
    };
    return artifactTracker;
}
