type Params = {
    key: string;
    paradigm?: "html" | "json";
};
export default function getCache({ key, paradigm }: Params): string | undefined;
export {};
