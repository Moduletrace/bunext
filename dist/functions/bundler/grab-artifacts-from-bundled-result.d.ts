import * as esbuild from "esbuild";
import type { BundlerCTXMap, PageFiles } from "../../types";
type Params = {
    result: esbuild.BuildResult<esbuild.BuildOptions>;
    entryToPage: Map<string, PageFiles & {
        tsx: string;
    }>;
    virtual_match?: string;
};
export default function grabArtifactsFromBundledResults({ result, entryToPage, virtual_match, }: Params): BundlerCTXMap[] | undefined;
export {};
