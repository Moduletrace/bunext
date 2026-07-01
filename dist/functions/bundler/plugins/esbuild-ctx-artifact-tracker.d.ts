import { type Plugin } from "esbuild";
import type { PageFiles } from "../../../types";
type Params = {
    entryToPage: Map<string, PageFiles & {
        tsx: string;
    }>;
    post_build_fn?: (params: {
        artifacts: any[];
    }) => Promise<void> | void;
    build_only?: boolean;
};
export default function esbuildCTXArtifactTracker({ entryToPage, post_build_fn, build_only, }: Params): Plugin;
export {};
