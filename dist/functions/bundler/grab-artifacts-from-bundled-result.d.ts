import * as esbuild from "esbuild";
import type { BundlerCTXMap, PageFiles } from "../../types";
type Params = {
    result: esbuild.BuildResult<esbuild.BuildOptions>;
    entryToPage: Map<string, PageFiles & {
        tsx: string;
    }>;
};
export default function grabArtifactsFromBundledResults({ result, entryToPage, }: Params): BundlerCTXMap[] | undefined;
export {};
