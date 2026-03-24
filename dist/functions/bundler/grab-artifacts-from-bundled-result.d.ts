import * as esbuild from "esbuild";
import type { BundlerCTXMap, PageFiles } from "../../types";
type Params = {
    result: esbuild.BuildResult<esbuild.BuildOptions>;
    entryToPage: Map<string, PageFiles>;
};
export default function grabArtifactsFromBundledResults({ result, entryToPage, }: Params): BundlerCTXMap[] | undefined;
export {};
