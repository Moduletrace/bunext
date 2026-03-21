import type { BunxRouteParams } from "../types";
type Params = {
    req: Request;
};
export default function grabRouteParams({ req, }: Params): Promise<BunxRouteParams>;
export {};
