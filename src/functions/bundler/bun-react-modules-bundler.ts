import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import path from "path";
import { rmSync, mkdirSync, writeFileSync } from "fs";

const { BUNEXT_VENDOR_DIR, BUNX_CWD_DIR } = grabDirNames();

const VENDOR_ENTRIES: Record<string, string> = {
    react: `
        import React from "react";
        export const {
            Children, Component, Fragment, Profiler, PureComponent, StrictMode,
            Suspense, cloneElement, createContext, createElement, createRef,
            forwardRef, isValidElement, lazy, memo, startTransition,
            useCallback, useContext, useDebugValue, useDeferredValue, useEffect,
            useId, useImperativeHandle, useInsertionEffect, useLayoutEffect,
            useMemo, useReducer, useRef, useState, useSyncExternalStore,
            useTransition, version, use, cache, act,
        } = React;
        export default React;
    `,
    "react-dom": `
        import ReactDOM from "react-dom";
        export const {
            createPortal, flushSync, version,
        } = ReactDOM;
        export default ReactDOM;
    `,
    "react-dom_client": `
        import ReactDOMClient from "react-dom/client";
        export const { createRoot, hydrateRoot } = ReactDOMClient;
        export default ReactDOMClient;
    `,
    "react_jsx-runtime": `
        import JSXRuntime from "react/jsx-runtime";
        export const { jsx, jsxs, Fragment } = JSXRuntime;
    `,
    "react_jsx-dev-runtime": `
        import JSXDevRuntime from "react/jsx-dev-runtime";
        export const { jsxDEV, Fragment } = JSXDevRuntime;
    `,
};

export default async function bunReactModulesBundler() {
    const dev = isDevelopment();

    rmSync(BUNEXT_VENDOR_DIR, { force: true, recursive: true });

    const tmpDir = path.join(BUNEXT_VENDOR_DIR, "_tmp");
    mkdirSync(tmpDir, { recursive: true });

    const entrypoints: string[] = [];
    for (const [name, contents] of Object.entries(VENDOR_ENTRIES)) {
        const file = path.join(tmpDir, `${name}.mjs`);
        writeFileSync(file, contents);
        entrypoints.push(file);
    }

    await Bun.build({
        entrypoints,
        outdir: BUNEXT_VENDOR_DIR,
        splitting: true,
        format: "esm",
        target: "browser",
        minify: !dev,
        define: {
            "process.env.NODE_ENV": JSON.stringify(
                dev ? "development" : "production",
            ),
        },
    });

    rmSync(tmpDir, { force: true, recursive: true });

    const PUBLIC_ROOT = BUNEXT_VENDOR_DIR.replace(BUNX_CWD_DIR, "/.bunext");

    global.REACT_IMPORTS_MAP = {
        imports: {
            react: `${PUBLIC_ROOT}/react.js`,
            "react-dom": `${PUBLIC_ROOT}/react-dom.js`,
            "react-dom/client": `${PUBLIC_ROOT}/react-dom_client.js`,
            "react/jsx-runtime": `${PUBLIC_ROOT}/react_jsx-runtime.js`,
            "react/jsx-dev-runtime": `${PUBLIC_ROOT}/react_jsx-dev-runtime.js`,
        },
    };
}
