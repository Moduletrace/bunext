import type { BundlerCTXMap } from "../../../types";
type Params = {
    bundledMap?: BundlerCTXMap;
};
export default function ({ bundledMap }: Params): Promise<string>;
export {};
