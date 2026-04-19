import type { PageFiles } from "../types";
type Params = {
    exclude_api?: boolean;
    api_only?: boolean;
    include_server?: boolean;
};
export default function grabAllPages(params?: Params): PageFiles[];
export {};
