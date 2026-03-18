/**
 * # EJSON parse string
 */
function parse(string, reviver) {
    if (!string)
        return undefined;
    if (typeof string == "object")
        return string;
    if (typeof string !== "string")
        return undefined;
    try {
        return JSON.parse(string, reviver);
    }
    catch (error) {
        return undefined;
    }
}
/**
 * # EJSON stringify object
 */
function stringify(value, replacer, space) {
    try {
        return JSON.stringify(value, replacer || undefined, space);
    }
    catch (error) {
        return undefined;
    }
}
const EJSON = {
    parse,
    stringify,
};
export default EJSON;
