/**
 * # Convert Serialized Query back to object
 */
export default function deserializeQuery(query: string | {
    [s: string]: any;
}): {
    [s: string]: any;
};
