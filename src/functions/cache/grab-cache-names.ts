type Params = {
    key: string;
    paradigm?: "html" | "json";
};

export default function grabCacheNames({ key, paradigm = "html" }: Params) {
    const parsed_key = key.replace(/\//g, "-");
    const cache_name = `${parsed_key}.res.${paradigm}`;
    const cache_meta_name = `${parsed_key}.meta.json`;

    return { cache_name, cache_meta_name };
}
