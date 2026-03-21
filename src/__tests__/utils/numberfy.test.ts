import { describe, it, expect } from "bun:test";
import numberfy, { _n } from "../../utils/numberfy";

describe("numberfy", () => {
    it("converts a plain integer string", () => {
        expect(numberfy("42")).toBe(42);
    });

    it("converts a float string preserving decimals", () => {
        expect(numberfy("3.14")).toBe(3.14);
    });

    it("strips non-numeric characters", () => {
        expect(numberfy("$1,234.56")).toBe(1234.56);
    });

    it("returns 0 for an empty string", () => {
        expect(numberfy("")).toBe(0);
    });

    it("returns 0 for undefined", () => {
        expect(numberfy(undefined)).toBe(0);
    });

    it("returns 0 for null", () => {
        expect(numberfy(null)).toBe(0);
    });

    it("passes through a number directly", () => {
        expect(numberfy(7)).toBe(7);
    });

    it("rounds when no decimals specified and no decimal in input", () => {
        expect(numberfy("5.0")).toBe(5);
    });

    it("respects decimals=0 by rounding", () => {
        expect(numberfy("3.7", 0)).toBe(4);
    });

    it("respects explicit decimals parameter", () => {
        expect(numberfy("3.14159", 2)).toBe(3.14);
    });

    it("preserves existing decimal places when no decimals arg given", () => {
        expect(numberfy("1.500")).toBe(1.5);
    });

    it("strips a trailing dot", () => {
        expect(numberfy("5.")).toBe(5);
    });

    it("_n alias works identically", () => {
        expect(_n("10")).toBe(10);
    });
});
