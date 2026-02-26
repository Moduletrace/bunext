import EJSON from "./ejson";

/**
 * # Convert Serialized Query back to object
 */
export default function deserializeQuery(
    query: string | { [s: string]: any }
): {
    [s: string]: any;
} {
    let queryObject: { [s: string]: any } =
        typeof query == "object" ? query : Object(EJSON.parse(query));

    const keys = Object.keys(queryObject);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = queryObject[key];

        if (typeof value == "string") {
            if (value.match(/^\{|^\[/)) {
                queryObject[key] = EJSON.parse(value);
            }
        }
    }

    return queryObject;
}
