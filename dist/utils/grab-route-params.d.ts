import type { BunxRouteParams } from "../types";
type Params = {
    req: Request;
    query?: any;
};
export default function grabRouteParams({ req, query: passed_query, }: Params): Promise<BunxRouteParams>;
export {};
