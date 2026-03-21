import type { BunxRouteParams, GrabPageComponentRes } from "../../../types";
type Params = {
    error?: any;
    routeParams?: BunxRouteParams;
    is404?: boolean;
};
export default function grabPageErrorComponent({ error, routeParams, is404, }: Params): Promise<GrabPageComponentRes>;
export {};
