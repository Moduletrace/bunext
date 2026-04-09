import type { Plugin } from "esbuild";
import type { PageFiles } from "../../../types";
type Params = {
    entryToPage: Map<string, PageFiles & {
        tsx: string;
    }>;
};
export default function ssrVirtualFilesPlugin({ entryToPage }: Params): Plugin;
export {};
