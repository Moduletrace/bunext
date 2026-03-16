import _ from "lodash";
import type { BundlerCTXMap, GlobalHMRControllerObject } from "../../types";

type Params = {
    artifacts: BundlerCTXMap[];
};

export default async function serverPostBuildFn({ artifacts }: Params) {
    if (!global.IS_FIRST_BUNDLE_READY) {
        global.IS_FIRST_BUNDLE_READY = true;
    }

    if (!global.HMR_CONTROLLERS?.[0]) {
        return;
    }

    for (let i = 0; i < global.HMR_CONTROLLERS.length; i++) {
        const controller = global.HMR_CONTROLLERS[i];
        const target_artifact = artifacts.find(
            (a) => controller.target_map.local_path == a.local_path,
        );

        if (!target_artifact?.local_path) continue;

        const final_artifact: Omit<GlobalHMRControllerObject, "controller"> = {
            ..._.omit(controller, ["controller"]),
            target_map: target_artifact,
        };

        try {
            controller.controller.enqueue(
                `event: update\ndata: ${JSON.stringify(final_artifact)}\n\n`,
            );
        } catch {
            global.HMR_CONTROLLERS.splice(i, 1);
        }
    }
}
