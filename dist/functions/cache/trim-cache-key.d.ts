import type { APIResponseObject } from "../../types";
type Params = {
    key: string;
};
export default function trimCacheKey({ key, }: Params): Promise<APIResponseObject>;
export {};
