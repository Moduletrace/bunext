import grabPageBundledReactComponent from "./grab-page-bundled-react-component";
import _ from "lodash";
import { log } from "../../../utils/log";
import grabRootFilePath from "./grab-root-file-path";
import grabPageCombinedServerRes from "./grab-page-combined-server-res";
export default async function grabPageModules({ file_path, debug, url, query, routeParams, skip_server_res, }) {
    const now = Date.now();
    const { serverRes } = skip_server_res
        ? {}
        : await grabPageCombinedServerRes({
            file_path,
            debug,
            query,
            routeParams,
            url,
        });
    if (serverRes?.redirect?.destination) {
        return Response.redirect(serverRes.redirect.destination, serverRes.redirect.permanent
            ? 301
            : serverRes.redirect.status_code || 302);
    }
    const { root_file_path } = grabRootFilePath();
    const root_module = root_file_path
        ? await import(`${root_file_path}?t=${now}`)
        : undefined;
    const module = await import(`${file_path}?t=${now}`);
    if (debug) {
        log.info(`module:`, module);
    }
    const { component } = (await grabPageBundledReactComponent({
        file_path,
    })) || {};
    if (!component) {
        throw new Error(`Couldn't grab page component`);
    }
    if (debug) {
        log.info(`component:`, component);
    }
    return {
        component,
        serverRes,
        module,
        root_module,
    };
}
