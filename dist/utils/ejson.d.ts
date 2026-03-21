/**
 * # EJSON parse string
 */
declare function parse(string: string | null | number, reviver?: (this: any, key: string, value: any) => any): {
    [s: string]: any;
} | {
    [s: string]: any;
}[] | undefined;
/**
 * # EJSON stringify object
 */
declare function stringify(value: any, replacer?: ((this: any, key: string, value: any) => any) | null, space?: string | number): string | undefined;
declare const EJSON: {
    parse: typeof parse;
    stringify: typeof stringify;
};
export default EJSON;
