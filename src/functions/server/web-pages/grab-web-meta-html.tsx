import type { BunextPageModuleMeta } from "../../../types";

type Params = {
    meta: BunextPageModuleMeta;
};

export default function grabWebMetaHTML({ meta }: Params) {
    const keywords = meta.keywords
        ? Array.isArray(meta.keywords)
            ? meta.keywords.join(", ")
            : meta.keywords
        : undefined;

    return (
        <>
            {meta.title && <title>{meta.title}</title>}
            {meta.description && (
                <meta name="description" content={meta.description} />
            )}
            {keywords && <meta name="keywords" content={keywords} />}
            {meta.author && <meta name="author" content={meta.author} />}
            {meta.robots && <meta name="robots" content={meta.robots} />}
            {meta.canonical && (
                <link rel="canonical" href={meta.canonical} />
            )}
            {meta.themeColor && (
                <meta name="theme-color" content={meta.themeColor} />
            )}
            {meta.og?.title && (
                <meta property="og:title" content={meta.og.title} />
            )}
            {meta.og?.description && (
                <meta
                    property="og:description"
                    content={meta.og.description}
                />
            )}
            {meta.og?.image && (
                <meta property="og:image" content={meta.og.image} />
            )}
            {meta.og?.url && (
                <meta property="og:url" content={meta.og.url} />
            )}
            {meta.og?.type && (
                <meta property="og:type" content={meta.og.type} />
            )}
            {meta.og?.siteName && (
                <meta property="og:site_name" content={meta.og.siteName} />
            )}
            {meta.og?.locale && (
                <meta property="og:locale" content={meta.og.locale} />
            )}
            {meta.twitter?.card && (
                <meta name="twitter:card" content={meta.twitter.card} />
            )}
            {meta.twitter?.title && (
                <meta name="twitter:title" content={meta.twitter.title} />
            )}
            {meta.twitter?.description && (
                <meta
                    name="twitter:description"
                    content={meta.twitter.description}
                />
            )}
            {meta.twitter?.image && (
                <meta name="twitter:image" content={meta.twitter.image} />
            )}
            {meta.twitter?.site && (
                <meta name="twitter:site" content={meta.twitter.site} />
            )}
            {meta.twitter?.creator && (
                <meta name="twitter:creator" content={meta.twitter.creator} />
            )}
        </>
    );
}
