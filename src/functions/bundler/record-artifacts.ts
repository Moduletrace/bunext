import grabDirNames from "../../utils/grab-dir-names";
import type { BundlerCTXMap } from "../../types";

const { HYDRATION_DST_DIR_MAP_JSON_FILE } = grabDirNames();

type Params = {
    artifacts: BundlerCTXMap[];
};

export default async function recordArtifacts({ artifacts }: Params) {
    const artifacts_map: { [k: string]: BundlerCTXMap } = {};

    for (const artifact of artifacts) {
        if (artifact?.local_path) {
            artifacts_map[artifact.local_path] = artifact;
        }
    }

    if (global.BUNDLER_CTX_MAP) {
        global.BUNDLER_CTX_MAP = artifacts_map;
    }

    await Bun.write(
        HYDRATION_DST_DIR_MAP_JSON_FILE,
        JSON.stringify(artifacts_map, null, 4),
    );
}
