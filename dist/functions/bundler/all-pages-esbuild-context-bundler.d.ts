import type { BundlerCTXMap } from "../../types";
type Params = {
    post_build_fn?: (params: {
        artifacts: BundlerCTXMap[];
    }) => Promise<void> | void;
};
export default function allPagesESBuildContextBundler(params?: Params): Promise<void>;
export {};
