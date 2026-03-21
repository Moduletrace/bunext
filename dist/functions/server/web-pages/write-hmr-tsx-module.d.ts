import type { BundlerCTXMap } from "../../../types";
type Params = {
    tsx: string;
    out_file: string;
};
export default function writeHMRTsxModule({ tsx, out_file }: Params): Promise<Pick<BundlerCTXMap, "css_path" | "path" | "hash" | "type"> | undefined>;
export {};
