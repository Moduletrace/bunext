import { describe, it, expect } from "bun:test";
import deserializeQuery from "../../utils/deserialize-query";
describe("deserializeQuery", () => {
    it("passes through a plain object unchanged", () => {
        const input = { foo: "bar" };
        expect(deserializeQuery(input)).toEqual({ foo: "bar" });
    });
    it("parses a JSON string into an object", () => {
        const input = JSON.stringify({ a: 1, b: "hello" });
        expect(deserializeQuery(input)).toEqual({ a: 1, b: "hello" });
    });
    it("deep-parses string values that look like JSON objects", () => {
        const nested = { filter: JSON.stringify({ status: "active" }) };
        const result = deserializeQuery(nested);
        expect(result.filter).toEqual({ status: "active" });
    });
    it("deep-parses string values that look like JSON arrays", () => {
        const nested = { ids: JSON.stringify([1, 2, 3]) };
        const result = deserializeQuery(nested);
        expect(result.ids).toEqual([1, 2, 3]);
    });
    it("leaves plain string values alone", () => {
        const input = { name: "alice", age: "30" };
        expect(deserializeQuery(input)).toEqual({ name: "alice", age: "30" });
    });
    it("returns an empty object for an empty JSON string", () => {
        expect(deserializeQuery("{}")).toEqual({});
    });
    it("returns an empty object for an invalid JSON string", () => {
        // EJSON.parse returns undefined → Object(undefined) → {}
        expect(deserializeQuery("not-json")).toEqual({});
    });
});
