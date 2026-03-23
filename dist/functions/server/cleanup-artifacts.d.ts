import type { BundlerCTXMap } from "../../types";
type Params = {
    new_artifacts: BundlerCTXMap[];
};
export default function cleanupArtifacts({ new_artifacts }: Params): Promise<void>;
export {};
