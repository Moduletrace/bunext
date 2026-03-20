import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import init, {
    transform as wasmTransform,
    transformStyleAttribute as wasmTransformStyleAttribute,
    bundle as wasmBundle,
    bundleAsync as wasmBundleAsync,
    Features,
    browserslistToTargets,
    composeVisitors,
} from "lightningcss-wasm";

// Resolve the .wasm file at build time — Bun's bundler will inline this
// as a static path that gets embedded into the bundle.
const wasmBytes = readFileSync(
    require.resolve("lightningcss-wasm/lightningcss_node.wasm"),
);

await init(wasmBytes.toString());

export {
    wasmTransform as transform,
    wasmTransformStyleAttribute as transformStyleAttribute,
    wasmBundle as bundle,
    wasmBundleAsync as bundleAsync,
    Features,
    browserslistToTargets,
    composeVisitors,
};
