import type { BundlerCTXMap } from "../../types";
type Params = {
    watch?: boolean;
    exit_after_first_build?: boolean;
    post_build_fn?: (params: {
        artifacts: BundlerCTXMap[];
    }) => Promise<void>;
};
export default function allPagesBundler(params?: Params): Promise<void>;
export {};
