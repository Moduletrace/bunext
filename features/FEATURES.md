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
    middleware: async ({ req, url }) => {
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

**Status:** Shipped

Consumer projects can create and fully customize the underlying `Bun.serve()` instance by using Bunext's exported primitives directly. Instead of Bunext owning the server, the developer provides their own `Bun.serve()` call and integrates Bunext's request handler into it.

```ts
import bunext from "bunext";

await bunext.bunextInit();

const server = Bun.serve({
    routes: {
        "/*": {
            async GET(req) {
                return await bunext.bunextRequestHandler({ req });
            },
        },
    },
    port: 3000,
});
```

Exported primitives:

| Export | Description |
|--------|-------------|
| `bunextInit()` | Initializes config, router, and bundler |
| `bunextRequestHandler({ req })` | Main Bunext request dispatcher |
| `bunextLog` | Framework logger |

Use cases:
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

**Status:** Shipped

The `websocket` field in `bunext.config.ts` accepts a Bun [`WebSocketHandler`](https://bun.sh/docs/api/websockets) and passes it directly to `Bun.serve()`. This gives most projects a zero-config path to WebSockets; the custom server feature covers advanced upgrade routing.

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
import type { BunextConfig } from "bunext/src/types";
import { BunextWebsocket } from "./websocket";

const config: BunextConfig = {
    websocket: BunextWebsocket,
};

export default config;
```

A companion `serverOptions` field is also available to pass any other `Bun.serve()` options (TLS, error handler, `maxRequestBodySize`, etc.) without needing a custom server.
