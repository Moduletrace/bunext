import _ from "lodash";
import type { BundlerCTXMap, GlobalHMRControllerObject } from "../../types";
import grabPageComponent from "./web-pages/grab-page-component";

export default async function serverPostBuildFn() {
    // if (!global.IS_FIRST_BUNDLE_READY) {
    //     global.IS_FIRST_BUNDLE_READY = true;
    // }

    if (!global.HMR_CONTROLLERS?.[0] || !global.BUNDLER_CTX_MAP) {
        return;
    }

    for (let i = global.HMR_CONTROLLERS.length - 1; i >= 0; i--) {
        const controller = global.HMR_CONTROLLERS[i];

        if (!controller.target_map?.local_path) {
            continue;
        }

        const target_artifact =
            global.BUNDLER_CTX_MAP[controller.target_map.local_path];

        const mock_req = new Request(controller.page_url);

        const { serverRes } = await grabPageComponent({
            req: mock_req,
        });

        const final_artifact: Omit<GlobalHMRControllerObject, "controller"> = {
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
            let final_data: { [k: string]: any } = {};

            if (global.ROOT_FILE_UPDATED) {
                final_data = { reload: true };
            } else {
                final_data = final_artifact;
            }

            controller.controller.enqueue(
                `event: update\ndata: ${JSON.stringify(final_data)}\n\n`,
            );

            global.ROOT_FILE_UPDATED = false;
        } catch {
            global.HMR_CONTROLLERS.splice(i, 1);
        }
    }
}
