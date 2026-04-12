import type { BunxRouteParams, GrabPageComponentRes } from "../../../types";
type Params = {
    error?: any;
    routeParams?: BunxRouteParams;
    is404?: boolean;
    url?: URL;
};
export default function grabPageErrorComponent({ error, routeParams, is404, url, }: Params): Promise<GrabPageComponentRes | Response>;
export {};
