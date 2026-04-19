import _ from "lodash";
import grabPageComponent from "./web-pages/grab-page-component";
export default async function serverPostBuildFn(params) {
    if (!global.HMR_CONTROLLERS?.[0] || !global.BUNDLER_CTX_MAP) {
        return;
    }
    const reload_payload = { reload: true };
    const reload_enqueue = `event: update\ndata: ${JSON.stringify(reload_payload)}\n\n`;
    for (let i = global.HMR_CONTROLLERS.length - 1; i >= 0; i--) {
        const controller = global.HMR_CONTROLLERS[i];
        if (!controller) {
            continue;
        }
        if (!controller.target_map?.local_path) {
            // if (global.IS_404_PAGE) {
            //     controller.controller.enqueue(reload_enqueue);
            // }
            // if (!global.HMR_CONTROLLERS[i].page_reloaded) {
            //     controller.controller.enqueue(reload_enqueue);
            //     global.HMR_CONTROLLERS[i].page_reloaded = true;
            // }
            continue;
        }
        if (params?.reload_all_controllers) {
            controller.controller.enqueue(reload_enqueue);
            continue;
        }
        const target_artifact = global.BUNDLER_CTX_MAP[controller.target_map.local_path];
        if (!target_artifact.local_path) {
            controller.controller.enqueue(reload_enqueue);
            continue;
        }
        const mock_req = target_artifact.req_url
            ? new Request(target_artifact.req_url)
            : new Request(controller.page_url);
        const page_component = global.IS_SERVER_COMPONENT
            ? await grabPageComponent({
                req: mock_req,
                return_server_res_only: true,
                is_hydration: true,
            })
            : {};
        if (page_component instanceof Response) {
            continue;
        }
        const { serverRes } = page_component;
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
                final_data = reload_payload;
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
