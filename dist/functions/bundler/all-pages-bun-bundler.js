import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import { log } from "../../utils/log";
import tailwindcss from "bun-plugin-tailwind";
const { HYDRATION_DST_DIR } = grabDirNames();
export default async function allPagesBunBundler(params) {
    const { target = "browser" } = params || {};
    const pages = grabAllPages({ exclude_api: true });
    const dev = isDevelopment();
    let buildStart = 0;
    buildStart = performance.now();
    const build = await Bun.build({
        entrypoints: pages.map((p) => p.transformed_path),
        outdir: HYDRATION_DST_DIR,
        minify: true,
        format: "esm",
        define: {
            "process.env.NODE_ENV": JSON.stringify(dev ? "development" : "production"),
        },
        naming: {
            entry: "[name]/[hash].[ext]",
            chunk: "chunks/[name]-[hash].[ext]",
        },
        plugins: [
            tailwindcss,
            {
                name: "post-build",
                setup(build) {
                    build.onEnd((result) => {
                        console.log("result", result);
                    });
                },
            },
        ],
        // plugins: [
        // ],
        splitting: true,
        target,
        external: ["bun"],
    });
    console.log("build", build);
    if (build.success) {
        const elapsed = (performance.now() - buildStart).toFixed(0);
        log.success(`[Built] in ${elapsed}ms`);
    }
}
