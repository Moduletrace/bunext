import type { APIResponseObject } from "../../types";
type Params = {
    key: string;
    value: string;
    paradigm?: "html" | "json";
    expiry_seconds?: number;
};
export default function writeCache({ key, value, paradigm, expiry_seconds, }: Params): Promise<APIResponseObject>;
export {};
