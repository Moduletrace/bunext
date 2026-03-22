import _ from "lodash";
import grabPageComponent from "./web-pages/grab-page-component";
export default async function serverPostBuildFn({ artifacts }) {
    if (!global.IS_FIRST_BUNDLE_READY) {
        global.IS_FIRST_BUNDLE_READY = true;
    }
    if (!global.HMR_CONTROLLERS?.[0]) {
        return;
    }
    for (let i = 0; i < global.HMR_CONTROLLERS.length; i++) {
        const controller = global.HMR_CONTROLLERS[i];
        const target_artifact = artifacts.find((a) => controller.target_map?.local_path == a.local_path);
        const mock_req = new Request(controller.page_url);
        const { serverRes } = await grabPageComponent({
            req: mock_req,
        });
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
            console.log("global.ROOT_FILE_UPDATED", global.ROOT_FILE_UPDATED);
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
    }
}
