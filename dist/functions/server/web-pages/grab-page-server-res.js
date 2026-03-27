import _ from "lodash";
import { log } from "../../../utils/log";
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
        log.error(`Page ${url?.pathname} Server Error => ${error.message}\n`, error);
        return {
            ...default_props,
            error: error.message,
        };
    }
}
