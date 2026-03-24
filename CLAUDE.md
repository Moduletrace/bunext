# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Bunext is a Next.js-style meta-framework built on Bun and React 19. It provides file-system routing, SSR, HMR, and static site generation, using ESBuild for client-side bundling and Bun.serve() as the HTTP server.

## Commands

```bash
# Build the TypeScript source (outputs to dist/)
bun run build       # tsc

# Watch mode for development of the framework itself
bun run dev         # tsc --watch

# CLI commands exposed by the built package (used in consumer projects)
bunext dev          # Start dev server with HMR and file watcher
bunext build        # Bundle all pages for production
bunext start        # Start production server from pre-built artifacts
```

## Architecture

### Entry point
`src/index.ts` — Shebang CLI (`#!/usr/bin/env bun`). Uses Commander.js to dispatch `dev`, `build`, and `start` subcommands. Declares all global state (`global.CONFIG`, `global.ROUTER`, `global.BUNDLER_CTX`, `global.HMR_CONTROLLERS`, etc.).

### Command flow
- **`dev`**: init config → create FileSystemRouter → start ESBuild watch → start FS watcher → start Bun.serve() with HMR WebSocket
- **`build`**: init config → run allPagesBundler → exit after first successful build
- **`start`**: load `public/pages/map.json` (pre-built artifact map) → start Bun.serve() without bundler/watcher

### Key directories
- `src/commands/` — CLI command implementations
- `src/functions/bundler/` — ESBuild bundler; uses a virtual namespace plugin to create per-page client hydration entry points and emits `map.json`
- `src/functions/server/` — Server startup, route dispatch, HMR watcher, rebuild logic, web-page rendering pipeline
- `src/utils/` — Stateless helpers (directory paths, router, config constants, JSON parser, etc.)
- `src/types/` — Shared TypeScript types
- `src/presets/` — Default 404/500 components and sample `bunext.config.ts`

### Page module contract
Pages live in `src/pages/`. Server logic is **separated from page files** into companion `.server.ts` / `.server.tsx` files to avoid bundling server-only code into the client.

**Page file** (`page.tsx`) — client-safe exports only (bundled to the browser):
- Default export: React component receiving props from the server file
- `meta`: `BunextPageModuleMeta` — SEO/OG metadata
- `Head`: FC — extra `<head>` content
- `config`: `BunextRouteConfig` — cache settings
- `html_props`: `BunextHTMLProps` — attributes on the `<html>` element

**Server file** (`page.server.ts` or `page.server.tsx`) — server-only, never sent to the browser:
- Default export or `export const server`: `BunextPageServerFn` — runs server-side before rendering, return value becomes props

The framework resolves the companion by replacing the page extension with `.server.ts` or `.server.tsx`. If neither exists, no server function runs and only the default `url` prop is injected.

`__root.tsx` follows the same contract; its server companion is `__root.server.ts`.

API routes live in `src/pages/api/` and follow standard Bun `Request → Response` handler conventions.

### Bundler artifact tracking
`BundlerCTXMap` (stored in `global.BUNDLER_CTX_MAP`) maps each page to its bundled output path, content hash, and entrypoint. In production this is serialized to `public/pages/map.json` and loaded at startup.

### Config
Consumer projects define `bunext.config.ts` at their project root. The `BunextConfig` type fields: `distDir`, `assetsPrefix`, `origin`, `globalVars`, `port`, `development`.
