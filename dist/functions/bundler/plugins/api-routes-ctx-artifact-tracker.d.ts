import { type Plugin } from "esbuild";
import type { PageFiles } from "../../../types";
type Params = {
    pages: PageFiles[];
};
export default function apiRoutesCTXArtifactTracker({ pages }: Params): Plugin;
export {};
