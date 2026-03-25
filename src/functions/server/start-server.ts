import _ from "lodash";
import { log } from "../../utils/log";
import serverParamsGen from "./server-params-gen";

export default async function startServer() {
    const serverParams = await serverParamsGen();

    const server = Bun.serve(serverParams);

    global.SERVER = server;

    log.server(`http://${server.hostname}:${server.port}`);

    return server;
}
