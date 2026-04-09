import _ from "lodash";
import grabPageComponent from "./web-pages/grab-page-component";
import initPages from "../bundler/init-pages";
export default async function serverPostBuildFn() {
    // if (!global.IS_FIRST_BUNDLE_READY) {
    //     global.IS_FIRST_BUNDLE_READY = true;
    // }
    if (!global.HMR_CONTROLLERS?.[0] || !global.BUNDLER_CTX_MAP) {
        return;
    }
    for (let i = global.HMR_CONTROLLERS.length - 1; i >= 0; i--) {
        const controller = global.HMR_CONTROLLERS[i];
        if (!controller?.target_map?.local_path) {
            continue;
        }
        const target_artifact = global.BUNDLER_CTX_MAP[controller.target_map.local_path];
        const mock_req = new Request(controller.page_url);
        const { serverRes } = global.IS_SERVER_COMPONENT
            ? await grabPageComponent({
                req: mock_req,
                return_server_res_only: true,
            })
            : {};
        const final_artifact = {
            ..._.omit(controller, ["controller"]),
            target_map: target_artifact,
        };
        if (!target_artifact) {
            delete final_artifact.target_map;
        }
        if (serverRes) {
            final_artifact.page_props = serverRes;
        }
        try {
            let final_data = {};
            if (global.ROOT_FILE_UPDATED) {
                final_data = { reload: true };
            }
            else {
                final_data = final_artifact;
            }
            controller.controller.enqueue(`event: update\ndata: ${JSON.stringify(final_data)}\n\n`);
            global.ROOT_FILE_UPDATED = false;
        }
        catch {
            global.HMR_CONTROLLERS.splice(i, 1);
        }
        global.REACT_DOM_MODULE_CACHE.delete(target_artifact.local_path);
        initPages({
            target_page_file: target_artifact.local_path,
        });
    }
}
