import type { PageFiles } from "../types";
type Params = {
    exclude_api?: boolean;
};
export default function grabAllPages(params?: Params): PageFiles[];
export {};
