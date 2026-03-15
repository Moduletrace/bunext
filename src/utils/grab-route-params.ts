import type { Server } from "bun";
import type { BunxRouteParams } from "../types";
import deserializeQuery from "./deserialize-query";

type Params = {
    req: Request;
};

export default async function grabRouteParams({
    req,
}: Params): Promise<BunxRouteParams> {
    const url = new URL(req.url);

    const query = deserializeQuery(Object.fromEntries(url.searchParams));

    const body = await (async () => {
        try {
            return req.method == "GET" ? undefined : await req.json();
        } catch (error) {
            return {};
        }
    })();

    const routeParams: BunxRouteParams = {
        req,
        url,
        query,
        body,
    };

    return routeParams;
}
