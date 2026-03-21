import type { BundlerCTXMap } from "../../types";
type Params = {
    artifacts: BundlerCTXMap[];
};
export default function serverPostBuildFn({ artifacts }: Params): Promise<void>;
export {};
