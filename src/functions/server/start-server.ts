import AppNames from "../../utils/grab-app-names";
import allPagesBundler from "../bundler/all-pages-bundler";
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

    await allPagesBundler();

    console.log(
        `${name} Server Running on  http://localhost:${server.port} ...`,
    );

    if (params?.dev) {
        watcher();
    }

    return server;
}
