import _ from "lodash";
import AppNames from "../../utils/grab-app-names";
import allPagesBundler from "../bundler/all-pages-bundler";
import serverParamsGen from "./server-params-gen";
import watcher from "./watcher";
import serverPostBuildFn from "./server-post-build-fn";

type Params = {
    dev?: boolean;
};

export default async function startServer(params?: Params) {
    const { name } = AppNames;

    const serverParams = await serverParamsGen();

    if (params?.dev) {
        await allPagesBundler({
            watch: true,
            post_build_fn: serverPostBuildFn,
        });
        watcher();
    } else {
        global.IS_FIRST_BUNDLE_READY = true;
    }

    let bundle_ready_retries = 0;
    const MAX_BUNDLE_READY_RETRIES = 10;

    while (!global.IS_FIRST_BUNDLE_READY) {
        if (bundle_ready_retries > MAX_BUNDLE_READY_RETRIES) {
            console.error(`Couldn't grab first bundle for dev environment`);
            process.exit(1);
        }
        bundle_ready_retries++;
        await Bun.sleep(500);
    }

    const server = Bun.serve(serverParams);

    global.SERVER = server;

    console.log(
        `${name} Server Running on  http://localhost:${server.port} ...`,
    );

    return server;
}
