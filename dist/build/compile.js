import { resolve } from "path";
import { readFileSync } from "fs";
const shimPath = resolve(import.meta.dir, "lightningcss-wasm-shim.ts");
const wasmBytes = readFileSync(resolve(import.meta.dir, "node_modules/lightningcss-wasm/lightningcss_node.wasm"));
const wasmBase64 = wasmBytes.toString("base64");
const result = await Bun.build({
    entrypoints: ["./src/commands/index.ts"],
    outdir: "./build",
    target: "bun",
    plugins: [
        {
            name: "alias-lightningcss-to-wasm",
            setup(build) {
                build.onResolve({ filter: /^lightningcss$/ }, () => {
                    return {
                        path: "lightningcss",
                        namespace: "lcss-wasm-shim",
                    };
                });
                build.onResolve({ filter: /^lightningcss\// }, () => {
                    return {
                        path: "lightningcss",
                        namespace: "lcss-wasm-shim",
                    };
                });
                build.onLoad({ filter: /.*/, namespace: "lcss-wasm-shim" }, () => {
                    return {
                        contents: `
                            import init, {
                                transform as wasmTransform,
                                transformStyleAttribute as wasmTransformStyleAttribute,
                                bundle as wasmBundle,
                                bundleAsync as wasmBundleAsync,
                                Features,
                                browserslistToTargets,
                                composeVisitors,
                            } from "lightningcss-wasm";

                            const wasmBytes = Uint8Array.from(atob("${wasmBase64}"), c => c.charCodeAt(0));
                            await init(wasmBytes);

                            export {
                                wasmTransform as transform,
                                wasmTransformStyleAttribute as transformStyleAttribute,
                                wasmBundle as bundle,
                                wasmBundleAsync as bundleAsync,
                                Features,
                                browserslistToTargets,
                                composeVisitors,
                            };
                        `,
                        loader: "ts",
                    };
                });
            },
        },
    ],
});
if (!result.success) {
    console.error("Build failed:", result.logs);
    process.exit(1);
}
Bun.spawnSync({
    cmd: [
        "bun",
        "build",
        "./build/index.js",
        "--compile",
        "--outfile",
        "bin/bunext",
    ],
    stdout: "inherit",
    stderr: "inherit",
});
