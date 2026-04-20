import { type Plugin } from "esbuild";
import type { PageFiles } from "../../../types";
import grabArtifactsFromBundledResults from "../grab-artifacts-from-bundled-result";
import { writeFileSync } from "fs";
import path from "path";
import grabDirNames from "../../../utils/grab-dir-names";

let build_start = 0;
let build_starts = 0;
const MAX_BUILD_STARTS = 2;

const { BUNX_TMP_DIR } = grabDirNames();

type Params = {
    entryToPage: Map<
        string,
        PageFiles & {
            tsx: string;
        }
    >;
    post_build_fn?: (params: { artifacts: any[] }) => Promise<void> | void;
};

export default function ssrCTXArtifactTracker({
    entryToPage,
    post_build_fn,
}: Params) {
    const artifactTracker: Plugin = {
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

            build.onEnd(async (result) => {
                if (result.errors.length > 0) {
                    global.SSR_BUNDLER_CTX_DISPOSED = true;
                    await global.SSR_BUNDLER_CTX?.dispose();
                    build_starts = 0;
                    console.log("SSR Build errors:", result.errors);
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
                        if (
                            artifact?.local_path &&
                            global.SSR_BUNDLER_CTX_MAP
                        ) {
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

                try {
                    writeFileSync(
                        path.join(BUNX_TMP_DIR, "ctx-map.json"),
                        JSON.stringify(global.SSR_BUNDLER_CTX_MAP, null, 4),
                    );
                } catch (error) {}

                global.SSR_BUNDLER_CTX_DISPOSED = false;
            });
        },
    };

    return artifactTracker;
}
