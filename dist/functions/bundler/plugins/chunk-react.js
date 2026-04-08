// plugins/react-vendor-chunk-plugin.ts
import * as esbuild from "esbuild";
import path from "path";
import grabDirNames from "../../../utils/grab-dir-names";
const { BUNEXT_VENDOR_DIR } = grabDirNames();
const REACT_MODULES = new Set([
    "react",
    "react-dom",
    "react-dom/client",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
]);
const VENDOR_BASE = "/.bunext/public/vendor";
const REACT_ENTRIES = {
    react: `
    import React from "react";
    export const {
      Children, Component, Fragment, Profiler, PureComponent, StrictMode,
      Suspense, cloneElement, createContext, createElement, createFactory,
      createRef, forwardRef, isValidElement, lazy, memo, startTransition,
      useCallback, useContext, useDebugValue, useDeferredValue, useEffect,
      useId, useImperativeHandle, useInsertionEffect, useLayoutEffect,
      useMemo, useReducer, useRef, useState, useSyncExternalStore,
      useTransition, version,
    } = React;
    export default React;
  `,
    "react-dom": `
    import ReactDOM from "react-dom";
    export const {
      createPortal, flushSync, findDOMNode, hydrate, render,
      unmountComponentAtNode, version,
    } = ReactDOM;
    export default ReactDOM;
  `,
    "react-dom/client": `
    import ReactDOMClient from "react-dom/client";
    export const { createRoot, hydrateRoot } = ReactDOMClient;
    export default ReactDOMClient;
  `,
    "react/jsx-runtime": `
    import JSXRuntime from "react/jsx-runtime";
    export const { jsx, jsxs, Fragment } = JSXRuntime;
    export default JSXRuntime;
  `,
    "react/jsx-dev-runtime": `
    import JSXDevRuntime from "react/jsx-dev-runtime";
    export const { jsxDEV, Fragment } = JSXDevRuntime;
    export default JSXDevRuntime;
  `,
};
// Map bare specifier -> browser path
function vendorPath(specifier) {
    const filename = specifier.replace(/\//g, "_") + ".js";
    return `${VENDOR_BASE}/${filename}`;
}
function vendorOutfile(specifier) {
    const filename = specifier.replace(/\//g, "_") + ".js";
    return path.join(BUNEXT_VENDOR_DIR, filename);
}
export default function reactVendorChunkPlugin() {
    let vendorReady;
    return {
        name: "react-vendor-chunk",
        setup(build) {
            vendorReady ??= buildAllVendorChunks(build.initialOptions);
            build.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, async (args) => {
                const bare = args.path.replace(/\/index(\.m?js)?$/, "");
                if (!(bare in REACT_ENTRIES))
                    return;
                await vendorReady;
                return {
                    path: vendorPath(bare),
                    external: true,
                };
            });
        },
    };
}
async function buildAllVendorChunks(parentOptions) {
    await Promise.all(Object.entries(REACT_ENTRIES).map(([specifier, contents]) => esbuild.build({
        stdin: {
            contents,
            resolveDir: process.cwd(),
            loader: "tsx",
        },
        outfile: vendorOutfile(specifier),
        bundle: true,
        minify: parentOptions.minify,
        format: "esm",
        target: parentOptions.target,
        platform: "browser",
        define: parentOptions.define,
        mainFields: ["module", "main"],
        conditions: ["import", "default"],
    })));
}
