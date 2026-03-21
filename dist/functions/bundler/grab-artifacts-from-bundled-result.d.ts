import * as esbuild from "esbuild";
import type { BundlerCTXMap, PageFiles } from "../../types";
type Params = {
    result: esbuild.BuildResult<esbuild.BuildOptions>;
    pages: PageFiles[];
};
export default function grabArtifactsFromBundledResults({ result, pages, }: Params): BundlerCTXMap[] | undefined;
export {};
