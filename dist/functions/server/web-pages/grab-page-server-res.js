import _ from "lodash";
export default async function grabPageServerRes({ url, query, routeParams, server_function, }) {
    const default_props = {
        url: url
            ? {
                ..._.pick(url, [
                    "host",
                    "hostname",
                    "pathname",
                    "origin",
                    "port",
                    "search",
                    "searchParams",
                    "hash",
                    "href",
                    "password",
                    "protocol",
                    "username",
                ]),
            }
            : null,
        query,
    };
    try {
        if (routeParams) {
            const serverData = await server_function({
                ...routeParams,
                query: { ...routeParams.query, ...query },
            });
            return {
                ...serverData,
                ...default_props,
            };
        }
        return {
            ...default_props,
        };
    }
    catch (error) {
        return {
            ...default_props,
        };
    }
}
