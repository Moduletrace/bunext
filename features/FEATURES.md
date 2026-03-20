# Bunext — Planned Features

Features currently in development or planned for a future release.

---

## Middleware Request Mutation

**Status:** Planned (soon)

Extend the `middleware` function in `bunext.config.ts` to support returning a `Request` object. This allows the middleware to modify the incoming request — inject headers, attach auth context, set locale — and continue through the normal routing pipeline without short-circuiting.

The full return contract:

| Return value | Behaviour |
|---|---|
| `Response` | Short-circuits — response sent immediately, no further routing |
| `Request` | Replaces the original request and continues through the pipeline |
| `undefined` | Passes through unchanged (current behaviour) |

```ts
// bunext.config.ts
const config: BunextConfig = {
    middleware: async ({ req, url, server }) => {
        // Inject an auth header and continue
        const token = await verifySession(req);
        if (token) {
            const mutated = new Request(req, {
                headers: {
                    ...Object.fromEntries(req.headers),
                    "x-user-id": token.userId,
                },
            });
            return mutated;
        }

        // Short-circuit if not authenticated on protected routes
        if (url.pathname.startsWith("/dashboard")) {
            return Response.redirect("/login", 302);
        }

        // Otherwise continue unchanged
        return undefined;
    },
};
```

---

## Custom Server

**Status:** In development

Allow consumer projects to create and fully customize the underlying `Bun.serve()` instance. Instead of Bunext owning the server entirely, the developer can provide their own server setup and integrate Bunext's request handler into it.

This enables use cases that require low-level server control:
- Custom WebSocket upgrade handling
- Custom TLS/SSL configuration
- Integrating Bunext into an existing Bun server alongside other handlers
- Custom `error` and `lowMemoryMode` options on `Bun.serve()`

---

## Sass / SCSS Support

**Status:** Planned

Add Sass/SCSS support by integrating the `esbuild-sass-plugin` package into the ESBuild pipeline alongside the existing Tailwind plugin. ESBuild does not handle `.scss`/`.sass` files natively — the plugin intercepts those file loads, compiles them via Dart Sass, and returns standard CSS to ESBuild.

Implementation is straightforward: install `esbuild-sass-plugin`, add it to the plugins array in `allPagesBundler` and `writeHMRTsxModule`. No changes to the rest of the pipeline — CSS extraction, per-page bundling, and HMR CSS swapping all work the same way.

---

## Static Export (`bunext export`)

**Status:** Planned (low priority)

Add a `bunext export` command that pre-renders all pages to static HTML files, deployable to a CDN without a running server. This is a convenience feature for projects that have no dynamic server-side requirements.

A server is a fundamental requirement for Bunext — like WordPress, it is designed to run on a server. Static export is a secondary capability for edge cases, not a primary deployment model.

---

## WebSocket Support via Config

**Status:** Planned

Add a `websocket` parameter to `bunext.config.ts` to handle WebSocket connections without requiring a custom server. This gives most projects a zero-config path to WebSockets while the custom server feature covers advanced use cases.

Proposed config shape:

```ts
// bunext.config.ts
import type { BunextConfig } from "bunext/src/types";

const config: BunextConfig = {
    websocket: {
        message(ws, message) {
            ws.send(`echo: ${message}`);
        },
        open(ws) {
            console.log("Client connected");
        },
        close(ws, code, reason) {
            console.log("Client disconnected");
        },
    },
};

export default config;
```

The `websocket` field maps directly to Bun's [`WebSocketHandler`](https://bun.sh/docs/api/websockets) interface, passed through to `Bun.serve()`. WebSocket upgrade requests are handled automatically by the framework before the normal request pipeline runs.
