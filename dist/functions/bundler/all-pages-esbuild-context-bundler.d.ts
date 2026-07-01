import type { BundlerCTXMap } from "../../types";
type Params = {
    post_build_fn?: (params: {
        artifacts: BundlerCTXMap[];
    }) => Promise<void> | void;
    build_only?: boolean;
    start?: boolean;
};
export default function allPagesESBuildContextBundler(params?: Params): Promise<void>;
export {};
