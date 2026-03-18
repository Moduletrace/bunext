import deserializeQuery from "./deserialize-query";
export default async function grabRouteParams({ req, }) {
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
        query,
        body,
        server: global.SERVER,
    };
    return routeParams;
}
