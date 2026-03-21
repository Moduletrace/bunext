import bunext from "../../dist"; // => @moduletrace/bunext

const development = process.env.NODE_ENV == "development";
const port = process.env.PORT || 3700;

/**
 * Initialize Bunext
 */
await bunext.bunextInit();

/**
 * Start your custom server
 */
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
