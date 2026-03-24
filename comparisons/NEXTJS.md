# Bunext vs Next.js — Technical Comparison Report

**Framework:** `@moduletrace/bunext` v1.0.6
**Compared against:** Next.js 14/15 (App Router era)
**Date:** March 2026

---

## Table of Contents

- [Overview](#overview)
- [Architecture Summary](#architecture-summary)
- [Feature Matrix](#feature-matrix)
- [In-Depth Analysis](#in-depth-analysis)
  - [Routing](#routing)
  - [Rendering Model](#rendering-model)
  - [Data Fetching](#data-fetching)
  - [Hot Module Replacement](#hot-module-replacement)
  - [Bundling and Build Pipeline](#bundling-and-build-pipeline)
  - [Caching](#caching)
  - [Metadata and SEO](#metadata-and-seo)
  - [Layouts](#layouts)
  - [API Routes](#api-routes)
  - [Middleware](#middleware)
  - [Styling](#styling)
  - [Static Files](#static-files)
  - [Error Handling](#error-handling)
  - [TypeScript](#typescript)
  - [Configuration](#configuration)
  - [Deployment](#deployment)
  - [Client-Side Navigation](#client-side-navigation)
  - [Image and Font Optimization](#image-and-font-optimization)
  - [Ecosystem and Community](#ecosystem-and-community)
- [Where Bunext Leads](#where-bunext-leads)
- [Where Bunext Lags (within its own scope)](#where-bunext-lags)
- [Gap Assessment](#gap-assessment)
- [Roadmap Recommendations](#roadmap-recommendations)

---

## Overview

Bunext is a **server-rendering framework** for React, built on [Bun](https://bun.sh). Its scope is deliberate and narrow: handle incoming HTTP requests on the server, run server-side logic, render React components to HTML, and send the response. Client-side navigation, SPA routing, and client state management are intentionally outside its remit.

Next.js is the dominant full-stack React framework in the industry, maintained by Vercel. It has evolved from a pure SSR framework into a hybrid system that handles both server rendering and sophisticated client-side navigation, prefetching, SPA transitions, and (in the App Router) React Server Components. This makes it a substantially different product in terms of goals, not just implementation.

This report compares the two on their overlapping surface — server-side rendering, routing, data fetching, bundling, caching, and DX — and clearly marks where features are deliberately out of scope for Bunext rather than treating every Next.js feature as a missing item.

---

## Architecture Summary

| Concern               | Bunext                                     | Next.js                                         |
|-----------------------|--------------------------------------------|------------------------------------------------|
| Runtime               | Bun                                        | Node.js (or Edge via Vercel)                   |
| HTTP server           | `Bun.serve()`                              | Custom Node.js server / Vercel platform        |
| Bundler               | ESBuild (client), `tsc` (framework source) | Turbopack (dev) / Webpack (prod) / SWC         |
| Router                | `Bun.FileSystemRouter`                     | Custom (Pages Router) / React Router (App Router) |
| SSR method            | `renderToString` (complete response, by design) | `renderToReadableStream` (streaming)       |
| Component model       | Classic SSR + hydration                    | React Server Components + Client Components    |
| Data fetching         | Per-page `.server.ts` companion file       | `getServerSideProps`, `getStaticProps`, `fetch` in RSC |
| State persistence     | `window.__PAGE_PROPS__`                    | RSC payload, router cache                      |
| Dev HMR transport     | Server-Sent Events (SSE)                   | WebSocket                                      |
| Config format         | `bunext.config.ts`                         | `next.config.js` / `next.config.ts`            |

---

## Feature Matrix

> **Legend:** ✅ supported — ❌ not supported — `—` out of scope by design

| Feature                                      | Bunext | Next.js (Pages) | Next.js (App Router) |
|----------------------------------------------|:------:|:---------------:|:--------------------:|
| **Routing**                                  |        |                 |                      |
| File-system routing                          | ✅     | ✅              | ✅                   |
| Dynamic routes `[param]`                     | ✅     | ✅              | ✅                   |
| Catch-all routes `[...slug]`                 | ✅     | ✅              | ✅                   |
| Optional catch-all `[[...slug]]`             | ✅     | ✅              | ✅                   |
| Non-routed co-location directories           | ✅     | ❌              | ✅ (file-naming model) |
| Route groups `(group)`                       | ❌     | ❌              | ✅                   |
| Parallel routes `@slot`                      | ❌     | ❌              | ✅                   |
| Intercepting routes `(..)`                   | ❌     | ❌              | ✅                   |
| **Server Rendering**                         |        |                 |                      |
| Server-side rendering (SSR)                  | ✅     | ✅              | ✅                   |
| Per-page server function                     | ✅     | ✅              | ✅                   |
| Default URL prop (no server fn required)     | ✅     | ❌              | ❌                   |
| Conditional runtime cache from server fn     | ✅     | ❌              | ❌                   |
| Static site generation (SSG)                 | —      | ✅              | ✅                   |
| Incremental static regen (ISR)               | —      | ✅              | ✅                   |
| Streaming SSR / Suspense                     | ❌     | ❌              | ✅                   |
| React Server Components (RSC)                | —      | ❌              | ✅                   |
| **Data & Response**                          |        |                 |                      |
| Native `Request`/`Response` Web APIs         | ✅     | ❌ (wrapped)    | ❌ (wrapped)         |
| Page response transform (`resTransform`)     | ✅     | ❌              | ❌                   |
| Custom response options from server fn       | ✅     | ✅              | ✅                   |
| Redirects from server fn                     | ✅     | ✅              | ✅                   |
| API routes                                   | ✅     | ✅              | ✅ (Route Handlers)  |
| Server Actions (inline mutations)            | ❌     | ❌              | ✅                   |
| **Caching**                                  |        |                 |                      |
| File-based HTML caching                      | ✅     | ❌              | ❌                   |
| Full-route cache                             | —      | —               | ✅                   |
| Cache invalidation API                       | ❌     | ✅              | ✅                   |
| **Middleware**                               |        |                 |                      |
| Global middleware                            | ✅     | ✅              | ✅                   |
| Full Bun env in middleware (fs, native APIs) | ✅     | ❌              | ❌                   |
| Edge middleware                              | —      | ✅              | ✅                   |
| **Layouts & Structure**                      |        |                 |                      |
| Single root layout                           | ✅     | ✅ (`_app.tsx`) | ✅                   |
| Nested layouts per route segment             | ❌     | ❌              | ✅                   |
| `loading.tsx` skeletons                      | ❌     | ❌              | ✅                   |
| `error.tsx` boundaries                       | ❌     | ❌              | ✅                   |
| Custom 404 page                              | ✅     | ✅              | ✅                   |
| Custom 500 page                              | ✅     | ✅              | ✅                   |
| **Metadata & SEO**                           |        |                 |                      |
| SEO metadata (static)                        | ✅     | ✅              | ✅                   |
| SEO metadata (dynamic / async fn)            | ✅     | ✅              | ✅                   |
| Open Graph / Twitter cards                   | ✅     | ✅              | ✅                   |
| Custom `<head>` injection                    | ✅     | ✅              | ✅                   |
| **Bundling & Styling**                       |        |                 |                      |
| True HMR (no full page reload)               | ✅     | ✅              | ✅                   |
| Tailwind CSS                                 | ✅     | ✅              | ✅                   |
| Per-page CSS isolation (no global load)      | ✅     | ❌ (global only)| ✅                   |
| CSS class name scoping (CSS Modules)         | ❌     | ✅              | ✅                   |
| Sass / SCSS                                  | ❌ (planned) | ✅         | ✅                   |
| Image optimization                           | —      | ✅              | ✅                   |
| Font optimization                            | —      | ✅              | ✅                   |
| **TypeScript & Config**                      |        |                 |                      |
| TypeScript (first-class)                     | ✅     | ✅              | ✅                   |
| Zero-config TS execution (no transpile step) | ✅     | ❌              | ❌                   |
| Redirects / rewrites in config               | ❌     | ✅              | ✅                   |
| Custom response headers in config            | ❌     | ✅              | ✅                   |
| **Client-Side (out of scope for Bunext)**    |        |                 |                      |
| Client-side navigation (`<Link>`)            | —      | ✅              | ✅                   |
| Prefetching                                  | —      | ✅              | ✅                   |
| `useRouter` / `usePathname` hooks            | —      | ✅              | ✅                   |
| `useSearchParams` hook                       | —      | ✅              | ✅                   |
| **Server**                                   |        |                 |                      |
| WebSocket support                            | ✅     | ❌              | ❌                   |
| Custom server (bring your own `Bun.serve()`) | ✅     | ✅ (custom `server.js`) | ✅            |
| Extra server options (`tls`, `error`, etc.)  | ✅ (`serverOptions`) | ✅    | ✅                   |
| **Deployment**                               |        |                 |                      |
| Self-hosted (any server with runtime)        | ✅     | ✅              | ✅                   |
| No vendor lock-in                            | ✅     | ❌ (Vercel-optimised) | ❌            |
| Edge Runtime / CDN deployment                | —      | ✅              | ✅                   |
| Static export                                | ❌ (planned, low priority) | ✅   | ✅           |
| Plugin/adapter ecosystem                     | ❌     | ✅              | ✅                   |

---

## In-Depth Analysis

### Routing

**Bunext** uses `Bun.FileSystemRouter` with Next.js-style conventions. Pages in `src/pages/` are automatically mapped to URL routes. Dynamic segments work via `[param].tsx`. The router handles basic wildcard matching and query parameter parsing natively.

Catch-all routes (`[...slug].tsx`) and optional catch-all routes (`[[...slug]].tsx`) are supported natively by `Bun.FileSystemRouter` and work in Bunext — the test project confirms this with `src/pages/blog/[[...all]]/index.tsx`.

Any directory inside `src/pages/` whose name contains `--` or a parenthesis (`(` or `)`) is **completely ignored by the router**. This lets developers co-locate helper components, hooks, and utilities directly alongside the routes that use them without any routing side effects:

```
src/pages/
├── blog/
│   ├── (components)/    ← Not a route — co-location directory
│   │   ├── PostCard.tsx
│   │   └── PostList.tsx
│   ├── index.tsx        ← Route: /blog
│   └── [slug].tsx       ← Route: /blog/:slug
```

Next.js Pages Router has no equivalent — every `.tsx` file in `pages/` becomes a route, so helper components must live outside the `pages/` tree entirely. Next.js App Router handles this differently via file-naming convention: only files named `page.tsx` or `route.ts` are routes, so any other file can already be co-located freely. Bunext's explicit directory-level marker (`(dir)` or `--dir--`) provides the same benefit on top of a Pages Router-style filesystem convention.

**Gaps:**
- No route groups — every folder directly contributes to the URL structure.
- Parallel and intercepting routes (App Router features) are absent. These enable patterns like modals that preserve the previous URL (intercepting) or simultaneously rendering multiple independent route segments.

**Next.js** App Router introduced a richer segment-based routing model with `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `template.tsx` conventions at every level of the directory tree.

**Assessment:** Bunext's routing is comprehensive for most real-world URL structures. The remaining gaps are App Router-only advanced patterns.

---

### Rendering Model

**Bunext** uses the classic **SSR + hydration** model:

1. Server imports the page module, runs the `server` function, renders via `ReactDOM.renderToString()`.
2. The resulting HTML string is injected into an HTML template.
3. `window.__PAGE_PROPS__` is serialized and embedded in the HTML.
4. The browser downloads the ESBuild-bundled page script, which calls `hydrateRoot()` to attach React to the server-rendered DOM.

This model ships the full component tree as JavaScript to every client. React reconciles the server HTML against the client render.

**Next.js App Router** uses **React Server Components (RSC)**:

- Components marked without `"use client"` run only on the server. Their output is a serialized React tree (the RSC payload), not HTML. Zero JS is shipped to the client for those components.
- Only components marked `"use client"` are bundled and sent to the browser.
- This reduces the client JS payload for content-heavy pages at the cost of the `"use client"` / `"use server"` boundary complexity.

RSC is not on Bunext's roadmap. Its primary benefit — reducing client JS payload — is a client-side concern. From a server-rendering perspective, `renderToString` already executes the full component tree on the server. RSC adds significant architectural complexity without changing what the server does.

**Next.js also uses streaming SSR**: `renderToReadableStream` allows the server to flush the `<head>` and visible above-the-fold content immediately, then stream the rest as Suspense boundaries resolve.

**Bunext uses `renderToString` by design.** The response is a complete HTML document — every request produces a full, self-contained page. This is consistent with how traditional server-rendered frameworks (Rails, Django, Laravel) have always worked, and it keeps the server's contract simple: receive a request, return a complete response.

Streaming SSR's benefits — progressive flushing, Suspense-based partial rendering — are inherently tied to client-side coordination. They require the browser to receive and process an incomplete document and progressively hydrate sections as they arrive. This is a client-side concern, not a server-side one, and sits outside Bunext's model. The correct approach in Bunext for slow data fetches is to cache the rendered response so subsequent requests are served instantly.

**Assessment:** `renderToString` is a deliberate design choice, not a limitation. The tradeoff — TTFB on the first uncached request for a data-heavy page — is addressed by the caching layer rather than by streaming.

---

### Data Fetching

**Bunext** exposes a single data-fetching primitive: a companion **`.server.ts`** file alongside each page.

```ts
// src/pages/products.server.ts
import type { BunextPageServerFn } from "@moduletrace/bunext/types";

const server: BunextPageServerFn = async (ctx) => {
    const data = await db.query(...);
    return { props: { data } };
};

export default server;
```

The server file is never bundled into client JS — it runs exclusively on the server at request time. The return value is serialized to `window.__PAGE_PROPS__` and passed as component props. A `url` object (copy of the request `URL`) is **always** injected into server props as a default, so every page can read URL metadata without writing a server file at all.

**Design notes:**
- One server file per page. Data fetching is centralised at the page level, not scattered across components.
- The page file (`.tsx`) exports only client-safe code — the React component, `meta`, `Head`, `config`, and `html_props`. Server-only code (Bun APIs, database clients, `fs`) lives in the `.server.ts` companion and is never sent to the browser.
- All rendering is on-demand. SSG is intentionally out of scope — see [Caching](#caching) for how Bunext addresses this differently.
- Server function result is passed via `window.__PAGE_PROPS__`, serialized to JSON and embedded in the HTML — large payloads increase page size.

**Next.js Pages Router** offers `getServerSideProps` (SSR), `getStaticProps` (SSG), and `getStaticPaths` (dynamic SSG), giving three distinct rendering strategies per page.

**Next.js App Router** goes further: any Server Component can be `async` and `await` data directly inline. Multiple components on the same page can fetch independently and in parallel, each wrapped in a `<Suspense>` boundary for streaming.

**Assessment:** Bunext's single-server-function model is clean and deliberate. The absence of SSG is not a gap — it is a different paradigm: rather than pre-building pages at deploy time, Bunext renders on first request and caches the result for as long as needed. Pages that are never visited are never rendered; pages that are visited frequently are served from cache. This is strictly more efficient than building every possible page upfront.

---

### Hot Module Replacement

**Bunext** implements true HMR (as of v1.0.6) without full page reloads:

1. Every page gets an injected SSE connection to `/__hmr`.
2. When ESBuild finishes a rebuild, the server pushes an `update` event containing the new artifact metadata (JS path, CSS path, content hash) through the stream to all clients watching that page.
3. The client:
   - Swaps the CSS `<link>` tag for the updated stylesheet (cache-busted with `?t=<timestamp>`).
   - Removes the old hydration `<script id="bunext-client-hydration-script">` from the DOM.
   - Injects a new `<script type="module">` pointing to the updated bundle.
4. The new bundle calls `window.__BUNEXT_RERENDER__(NewComponent)` if a React root already exists, which calls `root.render()` to update the component tree in-place. Falls back to a fresh `hydrateRoot` if no root exists.
5. A dedicated endpoint `/__bunext_client_hmr__?href=<url>` re-bundles the target page component on demand, ensuring the injected script always reflects the latest source.

**Next.js** uses a WebSocket-based HMR channel. In the Pages Router it performs module-level hot replacement via webpack's HMR runtime. In the App Router it uses React's Fast Refresh for component-level updates, preserving local state across edits.

**Key difference:** Next.js Fast Refresh preserves component **local state** (e.g. a counter value, a form input) across edits as long as you don't change the component's hook signature. Bunext's current HMR calls `root.render(NewComponent)` with the same props but does not attempt to preserve local state. Any in-memory component state is lost on update.

**Assessment:** The HMR implementation is solid and genuinely avoids full page reloads. The missing piece is React Fast Refresh-style state preservation, which requires tighter integration with React's reconciler internals or the Babel/SWC Fast Refresh transform.

---

### Bundling and Build Pipeline

**Bunext** uses **ESBuild** for client-side bundling:

- A virtual namespace plugin generates in-memory hydration entry points for each page.
- Tailwind CSS is processed via PostCSS before bundling.
- Output files are content-hashed for cache-busting.
- An artifact tracker plugin collects output paths and hashes into `BundlerCTXMap`, stored in `global.BUNDLER_CTX_MAP` and serialized to `public/pages/map.json` on build.
- In dev, ESBuild runs in watch mode and rebuilds incrementally on file changes.
- The framework source itself is compiled with `tsc` (TypeScript compiler), not bundled.

**Next.js** uses:
- **Turbopack** (Rust-based, default in Next.js 15 dev) — significantly faster cold starts and incremental builds than webpack.
- **Webpack** (production builds in many setups, legacy default).
- **SWC** — a Rust-based TypeScript/JSX compiler replacing Babel for transforms.

ESBuild is fast and Bunext benefits from it, but Next.js's Turbopack is purpose-built for incremental React bundling with module-level granularity. Bunext rebuilds the entire client bundle on any change to `src/pages/`; Next.js Turbopack rebuilds only the affected module graph.

**Next.js config also exposes:**
- Webpack customization via `webpack()` callback in `next.config.js`.
- Built-in support for CSS Modules, Sass, and global CSS imports.
- `@next/bundle-analyzer` for visualizing bundle composition.
- Tree-shaking and dead code elimination are deeply integrated.

**Assessment:** ESBuild is a strong choice for speed. The main gap is granularity — Bunext's rebuild scope is the full page bundle, not just the changed module.

---

### Caching

Bunext's caching model is its answer to SSG. Rather than pre-building pages at deploy time, pages are rendered on first request and the HTML is cached on disk for subsequent requests. Only pages that are actually visited ever get rendered — pages that receive no traffic incur no build cost.

**Bunext** implements a **file-based HTML cache**:

- Enabled per-page via `config.cachePage` (exported from the page file) or returned dynamically from the server function in the `.server.ts` companion at runtime.
- On a cache miss, the rendered HTML is written to `public/__bunext/cache/<key>.res.html` alongside a metadata file `<key>.meta.json` (creation timestamp, expiry, paradigm).
- On a cache hit, the HTML file is read and returned with `X-Bunext-Cache: HIT`.
- A cron job runs every 30 seconds to delete expired entries.
- Cache is disabled entirely in development.
- No manual invalidation API — entries live until expired and deleted by the cron.
- Cache keys are generated via `encodeURIComponent()`, so `/foo/bar` (`%2Ffoo%2Fbar`) and `/foo-bar` (`%2Ffoo-bar`) produce distinct filenames with no collision risk.

The key distinction from SSG: Bunext's cache is **demand-driven**. A site with 10,000 possible URLs but 200 frequently visited ones will only ever cache those 200. SSG would build all 10,000 at deploy time — most of which may never be requested — and require a rebuild or ISR revalidation cycle whenever content changes.

**Next.js** has a multi-layer caching system:

| Layer | What it caches | Invalidation |
|---|---|---|
| Request memoization | `fetch` de-duplication within one render | Per-request (automatic) |
| Data cache | `fetch` responses across requests | `revalidatePath`, `revalidateTag`, time-based |
| Full Route Cache | Static rendered HTML+RSC payload | `revalidatePath`, redeploy |
| Router cache | Client-side RSC payload cache | Navigation, `router.refresh()` |

`revalidatePath('/products')` and `revalidateTag('product-list')` let you surgically invalidate parts of the cache on demand — for example, from a webhook after a CMS update.

**Assessment:** Bunext's cache model is philosophically different from Next.js's, not inferior to it. The meaningful remaining gap is a manual invalidation API — the ability to purge a specific cache entry on demand (e.g. from a CMS webhook) rather than waiting for time-based expiry.

---

### Metadata and SEO

**Bunext** supports both static and dynamic metadata. These exports live in the **page file** (not the `.server.ts` companion), since they are processed at the server HTML-generation step and may reference types from the client module:

- `export const meta: BunextPageModuleMeta` — static object with `title`, `description`, `keywords`, `author`, `robots`, `canonical`, `themeColor`, `og.*`, and `twitter.*` fields.
- `export const meta: BunextPageModuleMetaFn` — async function receiving `ctx` and `serverRes` for dynamic metadata based on fetched data.
- `export function Head(...)` — arbitrary JSX injected into `<head>` for anything beyond the meta API.

**Next.js Pages Router** uses `next/head`'s `<Head>` component directly in JSX — fully flexible but fragmented across the component tree. Next.js App Router introduced a first-class `metadata` export (static) and `generateMetadata` (async) with identical shape to Bunext's approach, suggesting Bunext's API here is well-aligned with the modern standard.

**Assessment:** Bunext's metadata API closely mirrors the Next.js App Router's `metadata`/`generateMetadata` pattern. This is one area where Bunext is on par with the current industry direction.

---

### Layouts

**Bunext** has a single-level root layout via `src/pages/__root.tsx`. It receives `children` (the current page component) and all server props, enabling shared navigation, footers, and theme providers.

**Next.js Pages Router** has `_app.tsx` — equivalent in concept.

**Next.js App Router** supports **nested layouts**: each route segment can have its own `layout.tsx`, and these layouts compose hierarchically. A route at `/dashboard/settings` can have layouts at `/`, `/dashboard/`, and `/dashboard/settings/` — each wrapping the next. Layouts do not re-render on navigation within their subtree, which is a significant performance win for large apps.

**Assessment:** The single-root-layout model is a meaningful limitation for apps with complex UI hierarchies (dashboards, multi-section apps). Implementing nested layouts would require integrating layout resolution into the route-matching pipeline.

---

### API Routes

**Bunext** maps `src/pages/api/` files to `/api/*` endpoints. The default export receives a `BunxRouteParams` object and returns a standard `Response`. A `config.maxRequestBodyMB` export controls the request body size limit per route.

**Next.js** App Router introduces **Route Handlers** (`route.ts`) which export named functions per HTTP verb (`GET`, `POST`, `PUT`, `DELETE`, etc.), making method routing explicit at the file level rather than branching inside the handler.

**Next.js Server Actions** go further: a server-side `async function` can be called directly from a Client Component (bound to a form `action` or called imperatively), with the framework handling the network request transparently. This replaces many `fetch('/api/...')` patterns.

**Assessment:** Bunext's API routes cover the standard use case well. Server Actions are a Next.js-specific pattern that would require significant framework work to support.

---

### Middleware

**Bunext** middleware is defined in `bunext.config.ts` as a single global function that runs before every request. The return value determines what happens next:

| Return value | Behaviour |
|---|---|
| `Response` | Short-circuits — the response is sent immediately, no further routing |
| `Request` | *(planned)* Replaces the request and continues through the pipeline |
| `undefined` | Passes through unchanged |

The planned `Request` return allows header injection, auth token forwarding, locale detection, or any other request mutation without terminating the pipeline — a clean, standard-API alternative to Next.js's custom `NextResponse.next({ headers: ... })` pattern. The middleware function receives `{ req, url }`. The server instance is managed internally and does not need to be passed explicitly.

**Next.js** middleware runs per-request in a lightweight Edge Runtime (V8 isolate), with matched route patterns configured via `matcher`. It uses `NextRequest`/`NextResponse` extensions for rewriting, redirecting, and injecting headers without returning a full response.

**Key differences:**
- Bunext middleware runs in the same Bun process as the server with full environment access — no Edge Runtime restrictions.
- Next.js middleware can be deployed to the edge (CDN nodes), running geographically close to the user.
- Next.js middleware can rewrite the URL without a redirect (`NextResponse.rewrite()`). Bunext has no equivalent for this currently.

**Assessment:** Once the `Request` return is implemented, Bunext's middleware will cover all common use cases — auth guards, header injection, redirects, and request mutation — with a cleaner API than `NextResponse.next()`. The remaining gap is URL rewriting and edge deployment.

---

### Styling

**Bunext** supports:
- Tailwind CSS v4 via the `@tailwindcss/postcss` plugin, integrated directly into the ESBuild pipeline.
- Plain CSS files imported from any page or component file.
- CSS is extracted **per-page** by ESBuild into a separate `.css` bundle and linked via `<link rel="stylesheet">` only on the page that imports it. Pages that don't import a given CSS file never load it.

This is a meaningful advantage over Next.js's global CSS model. In Next.js's Pages Router, plain CSS can only be imported inside `_app.tsx`, which means it loads on **every page** regardless of whether that page uses it. The only way to get per-component CSS isolation in Next.js is to use CSS Modules or the App Router. In Bunext, per-page isolation is the natural default — just import a CSS file and it goes to that page only.

**What CSS Modules add that Bunext does not have:** class name scoping. If two components on the same page both define `.button`, they will conflict in Bunext. CSS Modules transform class names at build time (`.button` → `.button_abc123`) to prevent this. In practice this concern is largely eliminated if you use Tailwind, where utility classes have no collision risk.

**Next.js** supports:
- Tailwind CSS.
- **CSS Modules** (`.module.css`) — locally scoped class names, per-component code splitting.
- Sass/SCSS (planned — requires `esbuild-sass-plugin`).
- Global CSS (Pages Router: `_app.tsx` only; App Router: root layout).
- CSS-in-JS (`styled-components`, `emotion`) with SSR support.

**Assessment:** Bunext's per-page CSS bundling is superior to Next.js's global CSS approach and equivalent to CSS Modules for loading isolation. The only gap is class name scoping, which is only relevant if not using Tailwind.

---

### Static Files

**Bunext** serves files from `public/` at the `/public/` URL path. Favicons are matched at `/favicon.*`. Files have a 7-day browser cache (`Cache-Control: public, max-age=604800`).

**Next.js** serves files from `/public/` at the root URL path (i.e. `public/logo.png` → `/logo.png`). This is a minor but user-visible difference — absolute URL paths to static assets differ between the two frameworks.

---

### Error Handling

**Bunext** has two error page conventions: `src/pages/404.tsx` and `src/pages/500.tsx`. If these don't exist, built-in preset components are used. The error message is passed as `children`.

**Next.js App Router** adds `error.tsx` files at any route segment level. These are React Error Boundaries rendered on the client, enabling graceful per-section error recovery without the whole page going to a 500. `not-found.tsx` handles 404s per-segment. `global-error.tsx` wraps the root layout.

**Assessment:** Bunext's model matches the Pages Router approach. Granular per-segment error recovery is an App Router feature that would require nested layout support as a prerequisite.

---

### TypeScript

Both frameworks are TypeScript-first. Bunext's type exports (`BunextPageServerFn`, `BunextPageModuleMeta`, `BunextPageModuleServerReturn`, `BunxRouteParams`, etc.) cover the core API surface.

Next.js provides additional type-safety features:
- **Typed route parameters** — `generateStaticParams` return types flow into page component `params` prop types.
- **`next/navigation` typed hooks** — `useRouter`, `usePathname`, `useSearchParams` are fully typed.
- TypeScript plugin for IDE support (auto-completion for file-system routes in `<Link href="...">`, type errors for invalid routes).

**Assessment:** Bunext's typing is solid for its current feature set. The lack of typed client-side navigation hooks is not a gap today since client-side navigation doesn't exist.

---

### Configuration

**Bunext** (`bunext.config.ts`) exposes: `port`, `origin`, `distDir`, `assetsPrefix`, `globalVars`, `development`, `defaultCacheExpiry`, `middleware`, `websocket`, `serverOptions`.

**Next.js** (`next.config.js`) additionally supports:
- `redirects()` — array of redirect rules evaluated at the server level.
- `rewrites()` — proxy/rewrite rules, useful for API proxying or A/B testing.
- `headers()` — inject arbitrary HTTP response headers by route pattern.
- `images` — image optimization domains, formats, sizes.
- `i18n` — internationalization routing configuration.
- `webpack(config)` — direct webpack config mutation for custom loaders and plugins.
- `env` — additional environment variables injected at build time.
- `output` — `"standalone"` or `"export"` build modes.

**Assessment:** Bunext's config covers the essentials. The `redirects` and `rewrites` config keys are the most practically missed for real deployments.

---

### Deployment

**Bunext** runs as a long-lived `Bun.serve()` process on any machine where Bun is installed. Deployment is `bunext build && bunext start`. No adapters, no platform lock-in.

A running server is a fundamental requirement — by design, not by omission. Like WordPress, Bunext assumes a server is always present. The framework is built around request-time processing: server functions run on every request, caching handles performance, and the server is the source of truth. Static export is on the roadmap as a low-priority convenience feature for edge cases, not as a primary deployment model.

**Next.js** has:
- **Vercel** — zero-config deployment with automatic SSR, Edge Functions, ISR, image CDN, preview URLs.
- **Self-hosted Node.js** — `next build && next start`.
- **Standalone output** — `output: "standalone"` creates a minimal self-contained build folder.
- **Static export** — `output: "export"` pre-renders all pages to static HTML, deployable to any CDN.
- Community adapters for AWS Lambda, Cloudflare Workers, Netlify, Deno Deploy, etc.

**Assessment:** Bunext's deployment story is intentionally simple — any server with Bun, zero configuration. The tradeoff is no managed hosting integrations and no edge deployment. For teams that own their infrastructure this is a strength; for teams that want zero-ops deployment on Vercel, Next.js is the better fit.

---

### Client-Side Navigation

**Out of scope by design.**

Bunext is a server-rendering framework. Every navigation is a full server round-trip: the browser requests the URL, the server renders the page, and the full HTML is returned. This is the intended model, not a missing feature.

`next/link`, `useRouter`, `usePathname`, `useSearchParams`, prefetching, and SPA-style instant transitions are client-side framework concerns. They belong in a client-side routing layer. Bunext has no plans to implement them because doing so would pull the framework away from its server-first focus and towards the complexity of maintaining a client-side router in parallel with the server.

For use cases that genuinely require SPA navigation, Next.js (or a client-side router like TanStack Router combined with a separate API layer) is the appropriate tool. Bunext's target is server-rendered applications where each page is a complete server response.

---

### Image and Font Optimization

**Out of scope by design.**

Image and font optimisation are build-time or CDN-level concerns, not request-time server rendering concerns. Next.js includes them because it is a full-stack platform aiming to cover everything. For a server-rendering framework, the correct approach is to delegate these to purpose-built tools: a CDN (Cloudflare Images, Cloudinary, imgix) for image resizing and format conversion, and standard `<link rel="preload">` or self-hosted font files for fonts. These solutions are better at the job than a framework-bundled pipeline anyway.

---

### Ecosystem and Community

**Next.js** is the most widely used React framework:
- 130,000+ GitHub stars.
- Maintained by Vercel with a large full-time engineering team.
- Enormous ecosystem: authentication libraries (`next-auth`), CMS integrations, ORM adapters, testing utilities (`@testing-library/next`), and analytics plugins all target Next.js first.
- Extensive official documentation, tutorials, and community resources.

**Bunext** is an early-stage, single-author framework:
- No external plugin ecosystem.
- No authentication library integration.
- No community-contributed adapters.
- Documentation is the README and CLAUDE.md in this repository.

**Assessment:** Ecosystem is a lagging indicator — it grows as adoption grows. The risk is that third-party libraries that depend on Next.js internals (session handling, auth callbacks, CMS webhooks) require wrapper work to use with Bunext.

---

## Where Bunext Leads

### Raw Speed

Bun is significantly faster than Node.js on every measured axis:

| Operation            | Bun vs Node.js                        |
|----------------------|---------------------------------------|
| `bun install`        | ~30x faster than `npm install`        |
| Cold start           | ~4x faster startup time               |
| TypeScript execution | Native, no transpile step required    |
| HTTP throughput      | Higher req/s on equivalent hardware   |

The development feedback loop (save → ESBuild incremental rebuild → see change) is noticeably faster than `next dev` with webpack or even Turbopack.

### Codebase Size

Bunext's entire framework source is approximately **3,400 lines of TypeScript across 63 files**. A developer can read the complete codebase in a few hours and understand exactly what every line does.

Next.js's `packages/next/src` directory alone contains roughly **100,000+ lines of TypeScript/JavaScript** — approximately 30x more — for the same fundamental features within Bunext's scope. This excludes the Turbopack bundler (~150,000+ lines of Rust), the SWC compiler integration, `create-next-app`, and other packages. The full Next.js monorepo spans millions of lines.

The size difference is a direct consequence of Next.js having accumulated a decade of backwards compatibility obligations, two fully maintained routing paradigms (Pages Router and App Router), Vercel platform integration, edge runtime support, a dual webpack/Turbopack bundler layer, and RSC infrastructure. Each layer adds code that must be maintained, tested, and worked around when it misbehaves.

Bunext has none of that surface. When something breaks, the source is readable. When behaviour is unexpected, the pipeline from `Bun.serve()` to HTML response can be traced in minutes.

### Zero-Config TypeScript

Bun executes TypeScript natively. There is no `ts-node`, no Babel, no SWC setup, no `tsconfig` path-mapping workarounds. The framework source, config file, and application code all run as TypeScript directly — no compilation step in development.

Next.js uses SWC to strip types and transform JSX. It works well but introduces a layer that can diverge from `tsc` in edge cases, and it adds cold-start overhead.

### Pure Web Standard APIs

Bunext server functions and API handlers receive and return native Web API objects — `Request`, `Response`, `URL`, `Headers` — with no custom wrappers.

Next.js wraps these in `NextRequest` and `NextResponse`, which add convenience methods but also coupling. Code written against `NextRequest` does not port cleanly to other runtimes, testing environments, or tools that expect standard `Request` objects. Bunext server code is fully portable.

### Conditional Runtime Caching

Bunext's server function can return `cachePage: true` and `cacheExpiry: N` based on runtime data — the authenticated state of the user, A/B test bucket, content freshness, or any other request-time condition:

```ts
// src/pages/products.server.ts
import type { BunextPageServerFn } from "@moduletrace/bunext/types";

const server: BunextPageServerFn = async (ctx) => {
    const user = await getUser(ctx.req);
    return {
        props: { data },
        cachePage: !user,      // only cache for anonymous requests
        cacheExpiry: 300,
    };
};

export default server;
```

Next.js's ISR and full-route cache operate on fixed revalidation intervals set at build time. There is no mechanism to decide at runtime whether a specific request should be cached.

### Page Response Transform

The `resTransform` field in the server function's `ctx` parameter lets the developer post-process the final HTML response generated by the framework — add headers, set cookies, modify status codes — without touching middleware:

```ts
// src/pages/page.server.ts
import type { BunextPageServerFn } from "@moduletrace/bunext/types";

const server: BunextPageServerFn = async (ctx) => {
    ctx.resTransform = (res) => {
        res.headers.set("X-Custom-Header", "value");
        return res;
    };

    return { props: {} };
};

export default server;
```

This exists because page responses are generated entirely by the framework (`renderToString` → HTML template). Unlike API routes — where the developer returns a `Response` directly and already has full control — there is no other hook to modify the final page response at the route level without going through global middleware.

### Full Environment in Middleware

Bunext middleware runs inside the main Bun process with access to the full runtime: filesystem, native modules, databases, `Bun.file`, etc.

Next.js middleware runs in a restricted Edge Runtime (V8 isolate). It cannot access the filesystem, cannot use most Node.js built-ins, and is limited to a subset of npm packages. Any middleware logic that needs to hit a database or read a file must be pushed into the route handler instead.

### Simplicity and Transparency

Bunext's entire source is a few thousand lines of readable TypeScript. There are no Rust binaries, no webpack plugin chains, no internal framework APIs that are off-limits. A developer can read the full codebase in a few hours and understand exactly what happens to their request from `Bun.serve()` to the HTML response.

Next.js's codebase spans Turbopack (Rust), SWC (Rust), the App Router internals, and the Vercel deployment infrastructure — largely opaque. Debugging framework-level issues in Next.js often requires reading GitHub issues or accepting "use a workaround" as the answer.

### No Client/Server Boundary Overhead

The RSC model requires developers to constantly reason about the `"use client"` / `"use server"` boundary: what can be async, what has access to browser APIs, what gets serialized into the RSC payload. Mistakes at this boundary produce runtime errors that are difficult to diagnose.

Bunext has one rule: the `.server.ts` companion file runs on the server, the page file runs on both (SSR then hydration). The separation is enforced by the file system, not by decorators or directives. There is no boundary to reason about inside a file.

### No Vendor Lock-In

Bunext runs on any server where Bun is installed. There is no Vercel platform dependency, no proprietary deployment format, no ISR infrastructure that requires a managed host. `bunext build && bunext start` is the entire production deployment.

Next.js is technically self-hostable but is architecturally optimised for Vercel — features like ISR, image optimisation, Edge Middleware, and Analytics are either Vercel-only or degraded outside it.

### WebSocket and Custom Server

Bunext ships native WebSocket support via a `websocket` field in `bunext.config.ts`. The value is a Bun `WebSocketHandler` passed directly to `Bun.serve()` — no third-party library, no adapter, no separate process. Upgrade requests are triggered from any API route — only `req` is needed, as the server instance is managed internally by the framework.

Next.js has no built-in WebSocket support. Upgrading a connection requires a custom Node.js server (`server.js`) outside the Next.js framework, which loses access to Next.js's built-in routing and middleware for that connection.

For projects that need full control over `Bun.serve()` — custom TLS, multi-protocol handling, integrating Bunext alongside other handlers — Bunext exports `bunextInit()` and `bunextRequestHandler()` as first-class primitives. The developer owns the server; Bunext handles the request processing:

```ts
// server.ts
import bunext from "bunext";

const development = process.env.NODE_ENV === "development";

await bunext.bunextInit();

const server = Bun.serve({
    routes: {
        "/*": {
            async GET(req) {
                return await bunext.bunextRequestHandler({ req });
            },
        },
    },
    development,
    port: process.env.PORT || 3700,
});

bunext.bunextLog.info(`Server running on http://localhost:${server.port} ...`);
```

Next.js requires a `server.js` file that wraps `next()` — a documented but officially discouraged pattern that disables some platform-specific features on Vercel.

### Bun-Native APIs

Server functions and API routes have direct access to Bun's native APIs: `Bun.file()`, `Bun.write()`, the native SQLite driver, `Bun.password`, `Bun.serve` WebSocket support, etc. — without any Node.js compatibility shim or polyfill layer.

### Demand-Driven Caching as an SSG Alternative

Bunext's file-based cache is a deliberate alternative to SSG, not a consolation prize. SSG pre-renders every possible URL at deploy time — including pages that may never be visited — and requires a rebuild or ISR revalidation cycle when content changes. Bunext renders on first request and caches the result for as long as configured. Pages that are never visited are never rendered. Pages that are visited frequently are served from cache at the same speed as a static file.

This model also composes naturally with runtime decisions: the `server` function can choose whether to cache a response based on request context — user authentication state, content type, query parameters — something SSG cannot do at all.

### Default URL Prop

Every page component automatically receives a `url` prop (a copy of the request `URL` object) even without a `server` function. In Next.js's Pages Router, `getServerSideProps` must be exported just to access the request URL. The App Router exposes `params` and `searchParams` but not a full `URL` object.

### Co-Location Directories

Bunext's router ignores any directory inside `src/pages/` whose name contains `--` or a parenthesis. This lets helper components, hooks, and utilities live right next to the routes that use them — named `(components)`, `--utils--`, or similar — without any routing side effects.

Next.js Pages Router has no equivalent. Every file in `pages/` becomes a route; helpers must live in a separate root-level directory (`components/`, `lib/`, etc.) rather than alongside the pages that use them. Next.js App Router handles co-location via file-naming convention (only `page.tsx`/`route.ts` are routes), so the problem doesn't arise — but it provides no explicit directory-level exclusion marker.

---

## Where Bunext Lags

These are genuine gaps within Bunext's own scope — server-side rendering, build pipeline, and production operations. Client-side features are excluded because they are intentionally out of scope.

| Gap | Impact | Difficulty |
|---|---|---|
| No SSG | — out of scope by design; file-based cache is the intended alternative | — |
| Blocking SSR (`renderToString`) | — deliberate design choice; caching is the intended mitigation for slow pages | — |
| No nested layouts | Medium — limits composable page structure for complex apps | Medium |
| No cache invalidation API | Medium — limits production cache usefulness; must wait for expiry | Low–Medium |
| No redirects/rewrites in config | Low — workaround available via middleware | Low |
| HMR state preservation (Fast Refresh) | Low — DX improvement; local component state lost on edit | Medium |
| No CSS class name scoping | Low — only matters without Tailwind; naming conventions (BEM) are an alternative | Low |
| No image optimization | — out of scope; delegate to CDN or dedicated service | — |
| No React Server Components | — out of scope; RSC's benefits are client-side, not server-side | — |

---

## Gap Assessment

Within its stated goal — server-side rendering — Bunext covers the core surface well. File-system routing, SSR, API routes, per-page server functions, metadata, caching, HMR, middleware, and Tailwind all work. The metadata API closely mirrors the Next.js App Router's `metadata`/`generateMetadata` design, suggesting alignment with the current direction of the industry even without adopting RSC.

The meaningful server-side gaps are:

- **No SSG.** All pages are rendered on-demand. For content that doesn't change per request, this wastes compute and increases hosting cost. The `StaticProps` and `StaticPaths` types already exist in the codebase; the build-time rendering pass is missing.
- **Blocking SSR.** `renderToString` waits for the full React tree before sending the first byte. For pages with slow database queries this directly impacts TTFB. Streaming via `renderToReadableStream` and Suspense would fix this without requiring RSC.
- **No cache invalidation.** The file-based cache is time-expiry only. There is no way to purge a cache entry on demand (e.g. after a CMS update). A `revalidatePath`-style function callable from an API route or webhook would close this gap.

For use cases where Bunext is a strong fit:
- Server-rendered marketing and content sites.
- Form-heavy applications where each submission results in a server redirect.
- Internal tools and dashboards where every page load fetches fresh data anyway.
- Backend-for-frontend APIs paired with a separate client app.
- Projects where full control over the server runtime and deployment environment is a priority.

---

## Roadmap Recommendations

All items below are server-side concerns, aligned with Bunext's focus. Listed in suggested implementation order.

1. **Cache invalidation API** — expose `revalidatePath(path: string)` callable from API routes, webhooks, or server functions. This unblocks caching for content that changes on write (CMS updates, form submissions) rather than only on a timer.

2. **Config-level redirects and rewrites** — define `redirects` and `rewrites` arrays in `bunext.config.ts`, evaluated before routing. Low effort with high utility for proxying, legacy URL handling, and A/B routing.

3. **Nested layouts** — resolve the layout chain for each route at request time and compose `layout.tsx` files hierarchically. Server-side only concern; no client routing dependency.

4. **CSS class name scoping** — add an ESBuild plugin that processes `.module.css` imports, transforming class names to be unique at bundle time. Low priority given Tailwind support and the fact that per-page loading isolation is already solved.

