type Params = {
    key: string;
    paradigm?: "html" | "json";
};
export default function grabCacheNames({ key, paradigm }: Params): {
    cache_name: string;
    cache_meta_name: string;
};
export {};
