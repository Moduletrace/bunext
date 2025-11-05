import AppNames from "../../utils/grab-app-names";
import grabAppPort from "../../utils/grab-app-port";
import getRoute from "../router/get-route";
import grabRouteContent from "./grab-route-content";

export default async function startServer() {
    const config = global.CONFIG;
    const port = grabAppPort();
    const { name } = AppNames;

    const server = Bun.serve({
        async fetch(req) {
            try {
                const url = new URL(req.url);

                const route = await getRoute({ route: url.pathname });

                if (!route) {
                    return new Response(`Route ${url.pathname} not Found!`, {
                        status: 404,
                    });
                }

                const response = await grabRouteContent({ req, route, url });

                if (response) {
                    return response;
                }

                return new Response(`No Response!`, {
                    status: 404,
                });
            } catch (error: any) {
                return new Response(`Server Error: ${error.message}`, {
                    status: 500,
                });
            }
        },
        port,
        development: true,
    });

    global.SERVER = server;
    console.log(`${name} Server Running on Port ${server.port} ...`);

    return server;
}
