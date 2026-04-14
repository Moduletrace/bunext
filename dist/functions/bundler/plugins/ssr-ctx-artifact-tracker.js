import {} from "esbuild";
import grabArtifactsFromBundledResults from "../grab-artifacts-from-bundled-result";
let build_start = 0;
let build_starts = 0;
const MAX_BUILD_STARTS = 2;
export default function ssrCTXArtifactTracker({ entryToPage, post_build_fn, }) {
    const artifactTracker = {
        name: "ssr-artifact-tracker",
        setup(build) {
            build.onStart(async () => {
                build_starts++;
                build_start = performance.now();
                if (build_starts == MAX_BUILD_STARTS) {
                    global.SSR_BUNDLER_CTX_DISPOSED = true;
                    await global.SSR_BUNDLER_CTX?.dispose();
                    global.SSR_BUNDLER_CTX = undefined;
                }
            });
            build.onEnd((result) => {
                if (result.errors.length > 0) {
                    console.log("result.errors", result.errors);
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
                    // post_build_fn?.({ artifacts });
                    // const elapsed = (performance.now() - build_start).toFixed(
                    //     0,
                    // );
                    // log.success(`SSR [Built] in ${elapsed}ms`);
                }
                global.SSR_BUNDLER_CTX_DISPOSED = false;
            });
        },
    };
    return artifactTracker;
}
