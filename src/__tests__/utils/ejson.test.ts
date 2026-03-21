import { describe, it, expect } from "bun:test";
import EJSON from "../../utils/ejson";

describe("EJSON.parse", () => {
    it("parses a valid JSON string", () => {
        expect(EJSON.parse('{"a":1}')).toEqual({ a: 1 });
    });

    it("parses a JSON array string", () => {
        expect(EJSON.parse('[1,2,3]')).toEqual([1, 2, 3]);
    });

    it("returns undefined for null input", () => {
        expect(EJSON.parse(null)).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
        expect(EJSON.parse("")).toBeUndefined();
    });

    it("returns undefined for invalid JSON", () => {
        expect(EJSON.parse("{bad json")).toBeUndefined();
    });

    it("returns the object directly when passed an object (typeof object)", () => {
        const obj = { x: 1 };
        expect(EJSON.parse(obj as any)).toBe(obj);
    });

    it("returns undefined for a number input", () => {
        expect(EJSON.parse(42)).toBeUndefined();
    });

    it("applies a reviver function", () => {
        const result = EJSON.parse('{"a":"2"}', (key, value) =>
            key === "a" ? Number(value) : value,
        );
        expect(result).toEqual({ a: 2 });
    });
});

describe("EJSON.stringify", () => {
    it("stringifies an object", () => {
        expect(EJSON.stringify({ a: 1 })).toBe('{"a":1}');
    });

    it("stringifies an array", () => {
        expect(EJSON.stringify([1, 2, 3])).toBe("[1,2,3]");
    });

    it("applies spacing", () => {
        expect(EJSON.stringify({ a: 1 }, null, 2)).toBe('{\n  "a": 1\n}');
    });

    it("returns undefined for circular references", () => {
        const obj: any = {};
        obj.self = obj;
        expect(EJSON.stringify(obj)).toBeUndefined();
    });

    it("stringifies null", () => {
        expect(EJSON.stringify(null)).toBe("null");
    });

    it("stringifies a number", () => {
        expect(EJSON.stringify(42)).toBe("42");
    });
});
