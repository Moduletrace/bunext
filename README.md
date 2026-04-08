# Bunext

A server-rendering framework for React, built entirely on [Bun](https://bun.sh). Bunext handles file-system routing, SSR, HMR, and client hydration — using ESBuild to bundle client assets and `Bun.serve` as the HTTP server.

## Philosophy

Bunext is focused on **server-side rendering and processing**. Every page is rendered on the server on every request. The framework deliberately does not implement client-side navigation, SPA routing, or client-side state management — those concerns belong in client-side libraries and are orthogonal to what Bunext is solving.

The goal is a framework that is:

- Fast — Bun's runtime speed and ESBuild's bundling make the full dev loop snappy
- Transparent — the entire request pipeline is readable and debugable
- Standard — server functions and API handlers use native Web APIs (`Request`, `Response`, `URL`) with no custom wrappers

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Commands](#cli-commands)
- [Project Structure](#project-structure)
- [File-System Routing](#file-system-routing)
    - [Non-Routed Directories](#non-routed-directories)
- [Pages](#pages)
    - [Basic Page](#basic-page)
    - [Server Function](#server-function)
    - [Default Server Props](#default-server-props)
    - [Redirects from Server](#redirects-from-server)
    - [Custom Response Options](#custom-response-options)
    - [SEO Metadata](#seo-metadata)
    - [Dynamic Metadata](#dynamic-metadata)
    - [Custom Head Content](#custom-head-content)
    - [Root Layout](#root-layout)
- [API Routes](#api-routes)
    - [Route Config (Body Size Limit)](#route-config-body-size-limit)
- [Error Pages](#error-pages)
- [Static Files](#static-files)
- [Caching](#caching)
    - [Enabling Cache Per Page](#enabling-cache-per-page)
    - [Dynamic Cache Control from Server Function](#dynamic-cache-control-from-server-function)
    - [Cache Expiry](#cache-expiry)
    - [Cache Behavior and Limitations](#cache-behavior-and-limitations)
- [Configuration](#configuration)
    - [Middleware](#middleware)
    - [WebSocket](#websocket)
    - [Server Options](#server-options)
- [Custom Server](#custom-server)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
    - [Development Server](#development-server)
    - [Production Build](#production-build)
    - [Bundler](#bundler)
    - [Hot Module Replacement](#hot-module-replacement)
    - [Request Pipeline](#request-pipeline)

---

## Requirements

- [Bun](https://bun.sh) v1.0 or later
- TypeScript 5.0+

> **React is managed by Bunext.** You do not need to install `react` or `react-dom` — Bunext enforces its own pinned React version and removes any user-installed copies at startup to prevent version conflicts. Installing this package is all you need.

---

## Installation

### From the Moduletrace registry (recommended)

Configure the `@moduletrace` scope to point at the registry — pick one:

**`bunfig.toml`** (Bun-native):

```toml
[install.scopes]
"@moduletrace" = { registry = "https://git.tben.me/api/packages/moduletrace/npm/" }
```

**`.npmrc`** (works with npm, bun, and most tools):

```ini
@moduletrace:registry=https://git.tben.me/api/packages/moduletrace/npm/
```

Then install:

```bash
bun add @moduletrace/bunext
```

Or globally:

```bash
bun add -g @moduletrace/bunext
```

### From GitHub (alternative)

```bash
bun add github:moduletrace/bunext
```

---

## Quick Start

1. Create a minimal project layout:

```
my-app/
├── src/
│   └── pages/
│       └── index.tsx
├── bunext.config.ts      # optional
└── package.json
```

2. Create your first page (`src/pages/index.tsx`):

```tsx
export default function HomePage() {
    return <h1>Hello from Bunext!</h1>;
}
```

3. Add scripts to your `package.json`:

```json
{
    "scripts": {
        "dev": "bunx bunext dev",
        "build": "bunx bunext build",
        "start": "bunx bunext start"
    }
}
```

4. Start the development server:

```bash
bun run dev
```

5. Open `http://localhost:7000` in your browser.

---

## CLI Commands

| Command        | Description                                                                    |
| -------------- | ------------------------------------------------------------------------------ |
| `bunext dev`   | Start the development server with HMR and file watching.                       |
| `bunext build` | Bundle all pages for production. Outputs artifacts to `.bunext/public/pages/`. |
| `bunext start` | Start the production server using pre-built artifacts.                         |

### Running the CLI

Bunext exposes a `bunext` binary. How you invoke it depends on how the package is installed:

**Local install (recommended)** — add scripts to `package.json` and run them with `bun run`:

```json
{
    "scripts": {
        "dev": "bunx bunext dev",
        "build": "bunx bunext build",
        "start": "bunx bunext start"
    }
}
```

```bash
bun run dev
bun run build
bun run start
```

**Global install** — install once and use `bunext` from anywhere:

```bash
bun add -g @moduletrace/bunext
bunext dev
bunext build
bunext start
```

> **Note:** `bunext start` will exit with an error if `.bunext/public/pages/map.json` does not exist. Always run `bunext build` (or `bun run build`) before `bunext start`.

---

## Project Structure

A typical Bunext project has the following layout:

```
my-app/
├── src/
│   └── pages/             # File-system routes (pages and API handlers)
│       ├── __root.tsx          # Optional: root layout wrapper for all pages
│       ├── __root.server.ts    # Optional: root-level server logic
│       ├── index.tsx           # Route: /
│       ├── index.server.ts     # Optional: server logic for index route
│       ├── about.tsx           # Route: /about
│       ├── 404.tsx             # Optional: custom 404 page
│       ├── 500.tsx             # Optional: custom 500 page
│       ├── blog/
│       │   ├── index.tsx       # Route: /blog
│       │   ├── index.server.ts # Server logic for /blog
│       │   └── [slug].tsx      # Route: /blog/:slug (dynamic)
│       └── api/
│           └── users.ts        # API route: /api/users
├── public/                # Static files served at /public/*
├── .bunext/               # Internal build artifacts (do not edit manually)
│   └── public/
│       ├── pages/         # Generated by bundler
│       │   └── map.json   # Artifact map used by production server
│       └── cache/         # File-based HTML cache (production only)
├── bunext.config.ts       # Optional configuration
├── tsconfig.json
└── package.json
```

---

## File-System Routing

Bunext uses `Bun.FileSystemRouter` with Next.js-style routing. Pages live in `src/pages/` and are automatically mapped to URL routes:

| File path                        | URL path      |
| -------------------------------- | ------------- |
| `src/pages/index.tsx`            | `/`           |
| `src/pages/about.tsx`            | `/about`      |
| `src/pages/blog/index.tsx`       | `/blog`       |
| `src/pages/blog/[slug].tsx`      | `/blog/:slug` |
| `src/pages/users/[id]/index.tsx` | `/users/:id`  |
| `src/pages/api/users.ts`         | `/api/users`  |

Dynamic route parameters (e.g. `[slug]`) are available in the `server` function via `ctx.req.url` or from the `query` field in the server response.

### Non-Routed Directories

Directories whose name contains `--` or a parenthesis (`(` or `)`) are completely ignored by the router. Use this to co-locate helper components, utilities, or shared logic directly inside `src/pages/` alongside the routes that use them, without them becoming routes.

| Naming pattern  | Effect               |
| --------------- | -------------------- |
| `(components)/` | Ignored — not routed |
| `--utils--/`    | Ignored — not routed |
| `--lib/`        | Ignored — not routed |

```
src/pages/
├── blog/
│   ├── (components)/       # Not a route — co-location directory
│   │   ├── PostCard.tsx    # Used by index.tsx and [slug].tsx
│   │   └── PostList.tsx
│   ├── index.tsx           # Route: /blog
│   └── [slug].tsx          # Route: /blog/:slug
└── index.tsx               # Route: /
```

---

## Pages

### Basic Page

A page file must export a default React component. The component receives server-side props automatically.

```tsx
// src/pages/index.tsx
export default function HomePage() {
    return <h1>Hello, World!</h1>;
}
```

### Server Function

Server logic lives in a companion **`.server.ts`** (or `.server.tsx`) file alongside the page. The framework looks for `<page>.server.ts` or `<page>.server.tsx` next to the page file and loads it separately on the server — it is never bundled into the client JS.

The server file exports the server function as either `export default` or `export const server`. The return value's `props` field is spread into the page component as props, and `query` carries route query parameters.

```ts
// src/pages/profile.server.ts
import type { BunextPageServerFn } from "@moduletrace/bunext/types";

const server: BunextPageServerFn<{
    username: string;
    bio: string;
}> = async (ctx) => {
    // ctx.req — the raw Request object
    // ctx.url — the parsed URL
    // ctx.query — query string parameters
    // ctx.resTransform — optional response interceptor

    const username = "alice";
    const bio = "Software engineer";

    return {
        props: { username, bio },
    };
};

export default server;
```

```tsx
// src/pages/profile.tsx  (client-only exports — bundled to the browser)
type Props = {
    props?: { username: string; bio: string };
    query?: Record<string, string>;
    url?: URL;
};

export default function ProfilePage({ props, url }: Props) {
    return (
        <div>
            <h1>{props?.username}</h1>
            <p>{props?.bio}</p>
            <p>Current path: {url?.pathname}</p>
        </div>
    );
}
```

> **Why separate files?** Bundling server code (Bun APIs, database clients, `fs`, secrets) into the same file as a React component causes TypeScript compilation errors because the bundler processes the page file for the browser. The `.server.ts` companion file is loaded only by the server at request time and is never included in the client bundle.

The server function receives a `ctx` object (type `BunxRouteParams`) with:

| Field          | Type                                             | Description                                |
| -------------- | ------------------------------------------------ | ------------------------------------------ |
| `req`          | `Request`                                        | Raw Bun/Web Request object                 |
| `url`          | `URL`                                            | Parsed URL                                 |
| `body`         | `any`                                            | Parsed request body                        |
| `query`        | `any`                                            | Query string parameters                    |
| `resTransform` | `(res: Response) => Promise<Response>\|Response` | Intercept and transform the final response |

### Default Server Props

Every page component automatically receives a `url` prop — a copy of the request URL object — even if no `server` function is exported. This means you can always read URL data (pathname, search params, origin, etc.) directly from component props without writing a `server` function.

```tsx
// src/pages/index.tsx
import type { BunextPageModuleServerReturnURLObject } from "@moduletrace/bunext/types";

type Props = {
    url?: BunextPageModuleServerReturnURLObject;
};

export default function HomePage({ url }: Props) {
    return (
        <div>
            <p>Visiting: {url?.pathname}</p>
            <p>Origin: {url?.origin}</p>
        </div>
    );
}
```

The `url` prop exposes the following fields from the standard Web `URL` interface:

| Field          | Type              | Example                          |
| -------------- | ----------------- | -------------------------------- |
| `href`         | `string`          | `"https://example.com/blog?q=1"` |
| `origin`       | `string`          | `"https://example.com"`          |
| `protocol`     | `string`          | `"https:"`                       |
| `host`         | `string`          | `"example.com"`                  |
| `hostname`     | `string`          | `"example.com"`                  |
| `port`         | `string`          | `""`                             |
| `pathname`     | `string`          | `"/blog"`                        |
| `search`       | `string`          | `"?q=1"`                         |
| `searchParams` | `URLSearchParams` | `URLSearchParams { q: "1" }`     |
| `hash`         | `string`          | `""`                             |
| `username`     | `string`          | `""`                             |
| `password`     | `string`          | `""`                             |

### Redirects from Server

Return a `redirect` object from the server function to redirect the client:

```ts
// src/pages/dashboard.server.ts
import type { BunextPageServerFn } from "@moduletrace/bunext/types";

const server: BunextPageServerFn = async (ctx) => {
    const isLoggedIn = false; // check auth

    if (!isLoggedIn) {
        return {
            redirect: {
                destination: "/login",
                permanent: false, // uses 302
                // status_code: 307 // override status code
            },
        };
    }

    return { props: {} };
};

export default server;
```

`permanent: true` sends a `301` redirect. Otherwise it sends `302`, or the value of `status_code` if provided.

### Custom Response Options

Control status codes, headers, and other response options from the server function:

```ts
// src/pages/submit.server.ts
import type { BunextPageServerFn } from "@moduletrace/bunext/types";

const server: BunextPageServerFn = async (ctx) => {
    return {
        props: { message: "Created" },
        responseOptions: {
            status: 201,
            headers: {
                "X-Custom-Header": "my-value",
            },
        },
    };
};

export default server;
```

### SEO Metadata

Export a `meta` object from the **page file** (not the server file) to inject SEO and Open Graph tags into the `<head>`:

```tsx
import type { BunextPageModuleMeta } from "@moduletrace/bunext/types";

export const meta: BunextPageModuleMeta = {
    title: "My Page Title",
    description: "A description for search engines.",
    keywords: ["bun", "react", "ssr"],
    author: "Alice",
    robots: "index, follow",
    canonical: "https://example.com/about",
    themeColor: "#ffffff",
    og: {
        title: "My Page Title",
        description: "Shared on social media.",
        image: "https://example.com/og-image.png",
        url: "https://example.com/about",
        type: "website",
        siteName: "My Site",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "My Page Title",
        description: "Shared on Twitter.",
        image: "https://example.com/twitter-image.png",
        site: "@mysite",
        creator: "@alice",
    },
};

export default function AboutPage() {
    return <p>About us</p>;
}
```

### Dynamic Metadata

`meta` can also be an async function that receives the request context and server response. Like `meta`, it is exported from the **page file**:

```tsx
import type { BunextPageModuleMetaFn } from "@moduletrace/bunext/types";

export const meta: BunextPageModuleMetaFn = async ({ ctx, serverRes }) => {
    return {
        title: `Post: ${serverRes?.props?.title ?? "Untitled"}`,
        description: serverRes?.props?.excerpt,
    };
};
```

### Custom Head Content

Export a `Head` functional component to inject arbitrary HTML into `<head>`. It receives the server response and request context:

```tsx
import type { BunextPageHeadFCProps } from "@moduletrace/bunext/types";

export function Head({ serverRes, ctx }: BunextPageHeadFCProps) {
    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="icon" href="/public/favicon.ico" />
        </>
    );
}

export default function Page() {
    return <main>Content</main>;
}
```

### Root Layout

Create `src/pages/__root.tsx` to wrap every page in a shared layout. The root component receives `children` (the current page component) along with all server props.

If the root layout also needs server-side logic, place it in `src/pages/__root.server.ts` (or `.server.tsx`) — the same `.server.*` convention used by regular pages:

```ts
// src/pages/__root.server.ts
import type { BunextPageServerFn } from "@moduletrace/bunext/types";

const server: BunextPageServerFn = async (ctx) => {
    // e.g. fetch navigation links, check auth
    return { props: { navLinks: ["/", "/about"] } };
};

export default server;
```

```tsx
// src/pages/__root.tsx
import type { BunextRootComponentProps } from "@moduletrace/bunext/types";

export default function RootLayout({
    children,
    props,
}: BunextRootComponentProps) {
    return (
        <>
            <header>My App</header>
            <main>{children}</main>
            <footer>© 2025</footer>
        </>
    );
}
```

---

## API Routes

Create files under `src/pages/api/` to define API endpoints. The default export receives a `BunxRouteParams` object and must return a standard `Response`.

```ts
// src/pages/api/hello.ts
import type { BunxRouteParams } from "@moduletrace/bunext/types";

export default async function handler(ctx: BunxRouteParams): Promise<Response> {
    return Response.json({ message: "Hello from the API" });
}
```

API routes are matched at `/api/<filename>`. Because the handler returns a plain `Response`, you control the status code, headers, and body format entirely:

```ts
// src/pages/api/users.ts
import type { BunxRouteParams } from "@moduletrace/bunext/types";

export default async function handler(ctx: BunxRouteParams): Promise<Response> {
    if (ctx.req.method !== "GET") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const users = [{ id: 1, name: "Alice" }];

    return Response.json({ success: true, data: users });
}
```

The `ctx` parameter has the same shape as the page `server` function context — see the [Server Function](#server-function) section for the full field reference. The `ctx.server` field additionally exposes the Bun `Server` instance.

### Route Config (Body Size Limit)

Export a `config` object to override the per-route request body limit (default: 10 MB):

```ts
import type {
    BunextServerRouteConfig,
    BunxRouteParams,
} from "@moduletrace/bunext/types";

export const config: BunextServerRouteConfig = {
    maxRequestBodyMB: 50, // allow up to 50 MB
};

export default async function handler(ctx: BunxRouteParams): Promise<Response> {
    // handle large uploads
    return Response.json({ success: true });
}
```

---

## Error Pages

Bunext serves built-in fallback error pages, but you can override them by creating pages in `src/pages/`:

| File                | Triggered when                          |
| ------------------- | --------------------------------------- |
| `src/pages/404.tsx` | No matching route is found              |
| `src/pages/500.tsx` | An unhandled error occurs during render |

The error message is passed as `children` to the component:

```tsx
// src/pages/404.tsx
import type { PropsWithChildren } from "react";

export default function NotFoundPage({ children }: PropsWithChildren) {
    return (
        <div>
            <h1>404 — Page Not Found</h1>
            <p>{children}</p>
        </div>
    );
}
```

If no custom error pages exist, Bunext uses built-in preset components.

---

## Static Files

Place static files in the `public/` directory. They are served at the `/public/` URL path:

```
public/
├── logo.png         → http://localhost:7000/public/logo.png
├── styles.css       → http://localhost:7000/public/styles.css
└── favicon.ico      → http://localhost:7000/favicon.ico
```

> Favicons are also served from `/public/` but matched directly at `/favicon.*`.

---

## Caching

Bunext includes a file-based HTML cache for production. Caching is **disabled in development** — every request renders fresh. In production, a cron job runs every 30 seconds to delete expired cache entries.

Cache files are stored in `.bunext/public/cache/`. Each cached page produces two files:

| File              | Contents                                       |
| ----------------- | ---------------------------------------------- |
| `<key>.res.html`  | The cached HTML response body                  |
| `<key>.meta.json` | Metadata: creation timestamp, expiry, paradigm |

The cache is **cold on first request**: the first visitor triggers a full server render and writes the cache. Every subsequent request within the expiry window receives the cached HTML directly, bypassing the server function, component render, and bundler lookup. A cache hit is indicated by the response header `X-Bunext-Cache: HIT`.

### Enabling Cache Per Page

Export a `config` object from a page file to opt that page into caching:

```tsx
// src/pages/products.tsx
import type { BunextRouteConfig } from "@moduletrace/bunext/types";

export const config: BunextRouteConfig = {
    cachePage: true,
    cacheExpiry: 300, // seconds — optional, overrides the global default
};

export default function ProductsPage() {
    return <h1>Products</h1>;
}
```

### Dynamic Cache Control from Server Function

Cache settings can also be returned from the server function, which lets you conditionally enable caching based on request data:

```ts
// src/pages/products.server.ts
import type { BunextPageServerFn } from "@moduletrace/bunext/types";

const server: BunextPageServerFn = async (ctx) => {
    const data = await fetchProducts();

    return {
        props: { data },
        cachePage: true,
        cacheExpiry: 600, // 10 minutes
    };
};

export default server;
```

```tsx
// src/pages/products.tsx
export default function ProductsPage({ props }: any) {
    return (
        <ul>
            {props.data.map((p: any) => (
                <li key={p.id}>{p.name}</li>
            ))}
        </ul>
    );
}
```

If both `module.config.cachePage` and `serverRes.cachePage` are set, `module.config` takes precedence.

### Cache Expiry

Expiry resolution order (first truthy value wins):

1. `cacheExpiry` on the page `config` export or `server` return (per-page, in seconds)
2. `defaultCacheExpiry` in `bunext.config.ts` (global default, in seconds)
3. Built-in default: **3600 seconds (1 hour)**

The cron job checks all cache entries every 30 seconds and deletes any whose age exceeds their expiry. Static bundled assets (JS/CSS in `.bunext/public/`) receive a separate HTTP `Cache-Control: public, max-age=604800` header (7 days) via the browser cache — this is independent of the page HTML cache.

### Cache Behavior and Limitations

- **Production only.** Caching never activates in development (`bunext dev`).
- **Cold start required.** The cache is populated on the first request; there is no pre-warming step.
- **Immutable within the expiry window.** Once a page is cached, `writeCache` skips all subsequent write attempts for that key until the cron job deletes the expired entry. There is no manual invalidation API.
- **Cache is not cleared on rebuild.** Deploying a new build does not automatically flush `.bunext/public/cache/`. Stale HTML files referencing old JS bundles can be served until they expire. Clear the cache directory as part of your deploy process if needed.
- **No key collision.** Cache keys are generated via `encodeURIComponent()` on the URL path. `/foo/bar` encodes to `%2Ffoo%2Fbar` and `/foo-bar` to `%2Ffoo-bar` — distinct filenames with no collision risk.

---

## Configuration

Create a `bunext.config.ts` file in your project root to configure Bunext:

```ts
// bunext.config.ts
import type { BunextConfig } from "@moduletrace/bunext/types";

const config: BunextConfig = {
    port: 3000, // default: 7000
    origin: "https://example.com",
    distDir: ".bunext", // directory for internal build artifacts
    assetsPrefix: "_bunext/static",
    globalVars: {
        MY_API_URL: "https://api.example.com",
    },
    development: false, // forced by the CLI; set manually if needed
};

export default config;
```

| Option               | Type                                                                              | Default          | Description                                                                                       |
| -------------------- | --------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------- |
| `port`               | `number`                                                                          | `7000`           | HTTP server port                                                                                  |
| `origin`             | `string`                                                                          | —                | Canonical origin URL                                                                              |
| `distDir`            | `string`                                                                          | `.bunext`        | Internal artifact directory                                                                       |
| `assetsPrefix`       | `string`                                                                          | `_bunext/static` | URL prefix for static assets                                                                      |
| `globalVars`         | `{ [k: string]: any }`                                                            | —                | Variables injected globally at build time                                                         |
| `development`        | `boolean`                                                                         | —                | Overridden to `true` by `bunext dev` automatically                                                |
| `defaultCacheExpiry` | `number`                                                                          | `3600`           | Global page cache expiry in seconds                                                               |
| `middleware`         | `(params: BunextConfigMiddlewareParams) => Response \| undefined \| Promise<...>` | —                | Global middleware — see [Middleware](#middleware)                                                 |
| `websocket`          | `WebSocketHandler<any>`                                                           | —                | Bun WebSocket handler — see [WebSocket](#websocket)                                               |
| `serverOptions`      | `ServeOptions`                                                                    | —                | Extra options passed to `Bun.serve()` (excluding `fetch`) — see [Server Options](#server-options) |

### Middleware

Middleware runs on every request before any routing. Define it in `bunext.config.ts` via the `middleware` field. The function receives `{ req, url, server }` (type `BunextConfigMiddlewareParams`).

- If it returns a `Response`, that response is sent to the client immediately and no further routing occurs.
- If it returns `undefined` (or nothing), the request proceeds normally through the router.

```ts
// bunext.config.ts
import type {
    BunextConfig,
    BunextConfigMiddlewareParams,
} from "@moduletrace/bunext/types";

const config: BunextConfig = {
    middleware: async ({ req, url }) => {
        // Example: protect all /dashboard/* routes
        if (url.pathname.startsWith("/dashboard")) {
            const token = req.headers.get("authorization");

            if (!token) {
                return Response.redirect("/login", 302);
            }
        }

        // Return undefined to continue to the normal request pipeline
        return undefined;
    },
};

export default config;
```

The middleware can return any valid `Response`, including redirects, JSON, or HTML:

```ts
middleware: async ({ req, url }) => {
    // Block a specific path
    if (url.pathname === "/maintenance") {
        return new Response("Down for maintenance", { status: 503 });
    }

    // For API routes, return undefined to continue — the handler controls its own Response directly
},
```

### WebSocket

Add a `websocket` field to `bunext.config.ts` to handle WebSocket connections. The value is passed directly to `Bun.serve()` as the `websocket` option and accepts the full [`WebSocketHandler`](https://bun.sh/docs/api/websockets) interface.

Define the handler in its own file and import it into the config:

```ts
// websocket.ts
import type { WebSocketHandler } from "bun";

export const BunextWebsocket: WebSocketHandler<any> = {
    message(ws, message) {
        console.log(`WS Message => ${message}`);
    },
};
```

```ts
// bunext.config.ts
import type { BunextConfig } from "@moduletrace/bunext/types";
import { BunextWebsocket } from "./websocket";

const config: BunextConfig = {
    websocket: BunextWebsocket,
};

export default config;
```

### Server Options

Pass additional options to the underlying `Bun.serve()` call via `serverOptions`. All standard [`ServeOptions`](https://bun.sh/docs/api/http) fields are accepted except `fetch`, which Bunext manages internally.

```ts
// bunext.config.ts
import type { BunextConfig } from "@moduletrace/bunext/types";

const config: BunextConfig = {
    serverOptions: {
        tls: {
            cert: Bun.file("./certs/cert.pem"),
            key: Bun.file("./certs/key.pem"),
        },
        maxRequestBodySize: 64 * 1024 * 1024, // 64 MB
        error(err) {
            console.error("Server error:", err);
            return new Response("Internal Server Error", { status: 500 });
        },
    },
};

export default config;
```

---

## Custom Server

For full control over the `Bun.serve()` instance — custom WebSocket upgrade logic, multi-protocol handling, or integrating Bunext alongside other handlers — you can skip `bunext dev` / `bunext start` and run your own server using Bunext's exported primitives.

```ts
// server.ts
import bunext from "@moduletrace/bunext";

const development = process.env.NODE_ENV === "development";
const port = process.env.PORT || 3700;

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
    port,
});

bunext.bunextLog.info(`Server running on http://localhost:${server.port} ...`);
```

| Export                          | Type                                              | Description                                                                                                                                   |
| ------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `bunextInit()`                  | `() => Promise<void>`                             | Initializes config, router, and bundler. Must be called before handling requests.                                                             |
| `bunextRequestHandler({ req })` | `(params: { req: Request }) => Promise<Response>` | The main Bunext request dispatcher — middleware, routing, SSR, static files. Only `req` is needed; the server instance is managed internally. |
| `bunextLog`                     | Logger                                            | Framework logger (`info`, `error`, `success`, `server`, `watch`).                                                                             |

Run the custom server directly with Bun:

```bash
bun run server.ts
```

> **Note:** When using a custom server, HMR and file watching are still driven by `bunextInit()`. Pass `development: true` in your `Bun.serve()` call to enable them.

---

## Environment Variables

| Variable | Description                                             |
| -------- | ------------------------------------------------------- |
| `PORT`   | Override the server port (takes precedence over config) |

---

## How It Works

### Development Server

Running `bunext dev`:

1. Loads `bunext.config.ts` and sets `development: true`.
2. Initializes directories (`.bunext/`, `public/pages/`).
3. Creates a `Bun.FileSystemRouter` pointed at `src/pages/`.
4. Creates an ESBuild context and performs the initial build. File-change rebuilds are triggered manually by the FS watcher.
5. Starts a file-system watcher on `src/` — when a file is created or deleted (a "rename" event), it triggers a full bundler rebuild to update the entry points.
6. Waits for the first successful bundle.
7. Starts `Bun.serve()`.

### Production Build

Running `bunext build`:

1. Sets `NODE_ENV=production`.
2. Runs ESBuild once with minification enabled.
3. Writes all bundled artifacts to `.bunext/public/pages/` and the artifact map to `.bunext/public/pages/map.json`.
4. Exits.

### Production Server

Running `bunext start`:

1. Reads `.bunext/public/pages/map.json` to load the pre-built artifact map.
2. Starts `Bun.serve()` without any bundler or file watcher.

### Bundler

The bundler uses **ESBuild** with a virtual namespace plugin that generates in-memory hydration entry points for each page — no temporary files are written to disk. Each virtual entry imports the page component and calls `hydrateRoot()` against the server-rendered DOM node. If `src/pages/__root.tsx` exists, the page is wrapped in the root layout. Tailwind CSS is processed via a dedicated ESBuild plugin.

In development, an `esbuild.context()` is created once and rebuilt incrementally whenever the FS watcher detects a file change. In production, a single `esbuild.build()` call runs with minification enabled.

React is loaded externally — `react`, `react-dom`, `react-dom/client`, and `react/jsx-runtime` are all marked as external in the ESBuild config. The correct React version is resolved from the framework's own `node_modules` at startup and injected into every HTML page via a `<script type="importmap">` pointing at `esm.sh`. This guarantees a single shared React instance across all page bundles and HMR updates regardless of project size.

After each build, ESBuild's metafile is used to map each output file back to its source page, producing a `BundlerCTXMap[]`. This map is stored in `global.BUNDLER_CTX_MAP` and written to `.bunext/public/pages/map.json`.

Output files are named `[hash].[ext]` so filenames change when content changes, enabling cache-busting.

### Hot Module Replacement

In development, Bunext injects a script into every HTML page that opens a **Server-Sent Events (SSE)** connection to `/__hmr`. When a rebuild completes and the bundle hash for a page changes, the server pushes an `update` event through the stream containing the new artifact metadata. The client then performs a **true in-place HMR update** — no full page reload:

1. If the page has a CSS bundle, the old `<link rel="stylesheet">` is replaced with a new one pointing to the updated CSS file (cache-busted with `?t=<timestamp>`).
2. The existing client hydration `<script>` (identified by `id="bunext-client-hydration-script"`) is removed from the DOM.
3. A new `<script type="module">` is injected pointing to the freshly rebuilt JS bundle (also cache-busted).
4. The new bundle calls `window.__BUNEXT_RERENDER__(NewComponent)` if the root is already mounted, otherwise falls back to a fresh `hydrateRoot`.

The endpoint `/__bunext_client_hmr__?href=<page-url>` handles on-demand HMR bundle generation: it re-bundles the target page's component on every request so the freshly injected script always reflects the latest source.

The SSE controller for each connected client is tracked in `global.HMR_CONTROLLERS`, keyed by the page URL and its bundled artifact map entry. On disconnect, the controller is removed from the list.

### Request Pipeline

Every incoming request is handled by `Bun.serve()` and routed as follows:

```
Request
  │
  ├── config.middleware({ req, url, server })
  │     Returns Response? → short-circuit, send response immediately
  │     Returns undefined → continue
  │
  ├── GET /__hmr                        → Open SSE stream for HMR (dev only)
  │
  ├── GET /__bunext_client_hmr__?href=  → On-demand HMR bundle for the given page URL (dev only)
  │
  ├── /api/*              → API route handler
  │     Matches src/pages/api/<path>.ts
  │     Checks content-length against maxRequestBodyMB / 10 MB default
  │     Calls module.default(ctx) → returns Response directly
  │
  ├── /public/*           → Serve static file from public/
  │
  ├── /favicon.*          → Serve favicon from public/
  │
  └── Everything else     → Server-side render a page
        [Production only] Check .bunext/public/cache/ for key = pathname + search
          Cache HIT  → return cached HTML with X-Bunext-Cache: HIT header
          Cache MISS → continue ↓
        1. Match route via FileSystemRouter
        2. Find bundled artifact in BUNDLER_CTX_MAP
        3. Import page module (with cache-busting timestamp in dev)
        4. Import companion server module (<page>.server.ts/tsx) if it exists; run its exported function for server-side data
        5. Resolve meta (static object or async function)
        6. renderToString(component) → inject into HTML template
        7. Inject window.__PAGE_PROPS__, hydration <script>, CSS <link>
        8. If module.config.cachePage or serverRes.cachePage → write to cache
        9. Return HTML response
        On error → render 404 or 500 error page
```

Server-rendered HTML includes:

- `window.__PAGE_PROPS__` — the serialized server function return value, read by `hydrateRoot` on the client.
- A `<script type="importmap">` mapping React package specifiers to the esm.sh CDN (uses the `?dev` build in development).
- A `<script type="module" async>` tag pointing to the page's bundled client script.
- A `<link rel="stylesheet">` tag if the bundler emitted a CSS file for the page.
- In development: the HMR client script.
