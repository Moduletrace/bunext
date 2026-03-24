import type { BundlerCTXMap } from "../../types";
type Params = {
    artifacts: BundlerCTXMap[];
    page_file_paths?: string[];
};
export default function recordArtifacts({ artifacts, page_file_paths, }: Params): Promise<void>;
export {};
