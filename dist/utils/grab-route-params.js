import _ from "lodash";
import deserializeQuery from "./deserialize-query";
export default async function grabRouteParams({ req, query: passed_query, }) {
    const url = new URL(req.url);
    const query = deserializeQuery(Object.fromEntries(url.searchParams));
    const body = await (async () => {
        try {
            return req.method == "GET" ? undefined : await req.json();
        }
        catch (error) {
            return {};
        }
    })();
    const routeParams = {
        req,
        url,
        query: _.merge(query, passed_query),
        body,
        server: global.SERVER,
    };
    return routeParams;
}
