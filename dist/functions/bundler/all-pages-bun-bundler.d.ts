import type { BundlerCTXMap } from "../../types";
type Params = {
    target?: "bun" | "browser";
    page_file_paths?: string[];
};
export default function allPagesBunBundler(params?: Params): Promise<BundlerCTXMap[] | undefined>;
export {};
