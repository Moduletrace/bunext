Here's the full flow, start to finish:

---

1. Startup (index.ts → commands/dev/index.ts)

Running bun ../../index.ts dev:

- init() is called twice (once in index.ts, once in the dev command — redundant but harmless). It ensures all required
  directories exist (src/pages/, .bunext/client/hydration-src/, public/pages/, etc.) and creates a blank bunext.config.ts
  if missing.
- global.CONFIG is set with development: true.
- global.ROUTER is created as a Bun.FileSystemRouter pointing at src/pages/ using Next.js-style routing.

---

2. Initial Build (start-server.ts → allPagesBundler)

Before accepting requests, allPagesBundler() runs:

1. grabAllPages({ exclude_api: true }) — recursively walks src/pages/, skipping api/ routes and directories with ( or )
   in the name, returning an array of { local_path, url_path, file_name }.
2. For each page, writeWebPageHydrationScript() generates a .tsx entrypoint in
   .bunext/client/hydration-src/pageName.tsx. That file looks like:
   import React from "react";
   import { hydrateRoot } from "react-dom/client";
   import App from "/absolute/path/to/src/pages/index.tsx";
   const container = document.getElementById("bunext-root");
   hydrateRoot(container, <App {...window.**BUNEXT_PAGE_PROPS**} />);
3. Stale hydration files (for deleted pages) are cleaned up.
4. bundle() runs bun build .bunext/client/hydration-src/\*.tsx --outdir public/pages/ --minify via execSync. Bun bundles
   each entrypoint for the browser, outputting public/pages/pageName.js (and public/pages/pageName.css if any CSS was
   imported).

---

3. Server Start (server-params-gen.ts)

Bun.serve() is called with a single fetch handler that routes by URL pathname:

┌─────────────────┬──────────────────────────┐
│ Path │ Handler │
├─────────────────┼──────────────────────────┤
│ /\_\_hmr │ SSE stream for HMR │
├─────────────────┼──────────────────────────┤
│ /api/_ │ handleRoutes │
├─────────────────┼──────────────────────────┤
│ /public/_ │ Static file from public/ │
├─────────────────┼──────────────────────────┤
│ /favicon.\* │ Static file from public/ │
├─────────────────┼──────────────────────────┤
│ Everything else │ handleWebPages (SSR) │
└─────────────────┴──────────────────────────┘

---

4. Incoming Page Request → handleWebPages

4a. Route matching (grab-page-component.tsx)

- A new Bun.FileSystemRouter is created from src/pages/ (in dev; in prod it uses the cached global.ROUTER).
- router.match(url.pathname) resolves the URL to an absolute file path (e.g. / → .../src/pages/index.tsx).
- grabRouteParams() builds a BunxRouteParams object containing req, url, query (deserialized from search params), and
  body (parsed JSON for non-GET requests).

4b. Module import

const module = await import(`${file_path}?t=${global.LAST_BUILD_TIME ?? 0}`);

The ?t= cache-buster forces Bun to re-import the module after a rebuild instead of serving a stale cached version.

4c. server() function

If the page exports a server function, it's called with routeParams and its return value becomes serverRes — the props
passed to the component. This is the data-fetching layer (equivalent to Next.js getServerSideProps).

4d. Component instantiation

const Component = module.default as FC<any>;
const component = <Component {...serverRes} />;

The default export is treated as the page component, instantiated with the server-fetched props.

▎ If anything above throws (bad route, import error, etc.), the error path falls back to the /500 page (user-defined or
the preset).

---

5. HTML Generation (generate-web-html.tsx)

renderToString(component) is called — importing react-dom/server dynamically from process.cwd()/node_modules/ (the
consumer's React, avoiding the duplicate-instance bug).

The resulting HTML is assembled:

  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <link rel="stylesheet" href="/public/pages/index.css" /> <!-- if CSS exists -->
      <script>/* HMR EventSource, dev only */</script>
    </head>
    <body>
      <div id="bunext-root"><!-- renderToString output --></div>
      <script>window.__BUNEXT_PAGE_PROPS__ = {...}</script>
      <script src="/public/pages/index.js" type="module"></script>
    </body>
  </html>

The pageProps (from server()) are serialized via EJSON and injected as window.**BUNEXT_PAGE_PROPS** so the client
hydration script can read them without an extra network request.

---

6. Client Hydration (browser)

The browser:

1. Parses the server-rendered HTML and displays it immediately (no blank flash).
2. Loads /public/pages/index.js (the Bun-bundled client script).
3. That script calls hydrateRoot(container, <App {...window.**BUNEXT_PAGE_PROPS**} />) — React attaches event handlers
   to the existing DOM rather than re-rendering from scratch.

At this point the page is fully interactive.

---

7. HMR (dev only)

The injected EventSource("/\_\_hmr") maintains a persistent SSE connection. When the watcher detects a file change, it
rebuilds all pages, updates LAST_BUILD_TIME, and sends event: update\ndata: reload down the SSE stream. The browser
calls window.location.reload(), which re-requests the page and repeats steps 4–6 with the fresh module.
