import _ from "lodash";
import { log } from "../../../utils/log";
export default async function grabPageServerRes({ url, query, routeParams, server_function, props, }) {
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
    const init_props = props || null;
    try {
        if (routeParams && server_function) {
            const serverData = await server_function({
                ...routeParams,
                query: { ...routeParams.query, ...query },
                props: init_props,
            });
            return _.merge(default_props, serverData);
        }
        return _.merge(default_props);
    }
    catch (error) {
        log.error(`Page ${url?.pathname} Server Error => ${error.message}\n`, error);
        return _.merge(default_props, {
            error: error.message,
        });
    }
}
