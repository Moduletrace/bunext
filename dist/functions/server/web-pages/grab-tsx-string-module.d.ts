import type { GrabTSXModuleBatchParams, GrabTSXModuleSingleParams } from "../../../types";
type Params = GrabTSXModuleSingleParams | GrabTSXModuleBatchParams;
export default function grabTsxStringModule<T>(params: Params): Promise<T | T[]>;
export {};
