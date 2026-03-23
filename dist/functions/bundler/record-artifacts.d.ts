import type { BundlerCTXMap } from "../../types";
type Params = {
    artifacts: BundlerCTXMap[];
};
export default function recordArtifacts({ artifacts }: Params): Promise<void>;
export {};
