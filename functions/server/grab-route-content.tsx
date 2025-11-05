import type { GetRouteReturn } from "../../types";
import AppNames from "../../utils/grab-app-names";
import ReactDOMServer from "react-dom/server";

type Params = {
    url: URL;
    route: GetRouteReturn;
    req: Request;
};

export default async function grabRouteContent({
    url,
    route,
    req,
}: Params): Promise<Response> {
    const config = global.CONFIG;
    const { name } = AppNames;

    let html = `Welcome to ${name} ...`;

    if (route.component) {
        html = ReactDOMServer.renderToString(<route.component />);
        return new Response(html, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
            },
        });
    }

    return new Response(html);
}
