import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import tailwindcss from "bun-plugin-tailwind";
const { BUNX_CWD_MODULE_CACHE_DIR } = grabDirNames();
export default async function apiRoutesBundler() {
    const api_routes = grabAllPages({ api_only: true });
    const dev = isDevelopment();
    try {
        const build = await Bun.build({
            entrypoints: api_routes.map((r) => r.local_path),
            target: "bun",
            format: "esm",
            jsx: {
                runtime: "automatic",
                development: dev,
            },
            minify: !dev,
            define: {
                "process.env.NODE_ENV": JSON.stringify(dev ? "development" : "production"),
            },
            outdir: BUNX_CWD_MODULE_CACHE_DIR,
            plugins: [tailwindcss],
            naming: {
                entry: "api/[dir]/[name].[ext]",
                chunk: "api/[dir]/chunks/[hash].[ext]",
            },
            // external: [
            //     "react",
            //     "react-dom",
            //     "react-dom/client",
            //     "react/jsx-runtime",
            // ],
            splitting: true,
        });
    }
    catch (error) {
        console.log(`API paths build ERROR:`, error);
    }
}
