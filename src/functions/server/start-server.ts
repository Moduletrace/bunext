import AppNames from "../../utils/grab-app-names";
import serverParamsGen from "./server-params-gen";
import watcher from "./watcher";

type Params = {
    dev?: boolean;
};

export default async function startServer(params?: Params) {
    const { name } = AppNames;

    const serverParams = await serverParamsGen();

    const server = Bun.serve(serverParams);

    global.SERVER = server;

    console.log(
        `${name} Server Running on  http://localhost:${server.port} ...`,
    );

    if (params?.dev) {
        watcher();
    }

    return server;
}
