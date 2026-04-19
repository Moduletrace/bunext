import EJSON from "./ejson";

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function sanitize<T>(value: T): T {
    if (value === null || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(sanitize) as T;
    const clean: Record<string, any> = Object.create(null);
    for (const key of Object.keys(value as Record<string, any>)) {
        if (DANGEROUS_KEYS.has(key)) continue;
        clean[key] = sanitize((value as Record<string, any>)[key]);
    }
    return clean as T;
}

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

        if (DANGEROUS_KEYS.has(key)) {
            delete queryObject[key];
            continue;
        }

        if (typeof value == "string") {
            if (value.match(/^\{|^\[/)) {
                queryObject[key] = sanitize(EJSON.parse(value));
            }
        }
    }

    return sanitize(queryObject);
}
