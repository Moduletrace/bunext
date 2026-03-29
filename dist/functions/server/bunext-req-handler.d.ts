type Params = {
    req: Request;
    server: Bun.Server<any>;
};
export default function bunextRequestHandler({ req: initial_req, server, }: Params): Promise<Response>;
export {};
