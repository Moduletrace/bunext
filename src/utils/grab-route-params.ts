import _ from "lodash";
import type { BunxRouteParams } from "../types";
import deserializeQuery from "./deserialize-query";

type Params = {
    req: Request;
    query?: any;
};

export default async function grabRouteParams({
    req,
    query: passed_query,
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
        query: _.merge(query, passed_query),
        body,
        server: global.SERVER,
    };

    return routeParams;
}
