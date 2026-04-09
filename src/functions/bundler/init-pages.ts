import grabDirNames from "../../utils/grab-dir-names";
import isDevelopment from "../../utils/is-development";
import grabAllPages from "../../utils/grab-all-pages";
import { log } from "../../utils/log";
import type { GrabTSXModuleBatchMap } from "../../types";
import grabPageBundledReactComponent from "../server/web-pages/grab-page-bundled-react-component";
import grabTsxStringModule from "../server/web-pages/grab-tsx-string-module";

const {} = grabDirNames();

type Params = {
    log_time?: boolean;
    debug?: boolean;
    target_page_file?: string;
};

export default async function initPages(params?: Params) {
    const buildStart = performance.now();

    const dev = isDevelopment();
    const pages = grabAllPages({
        exclude_api: true,
    });

    if (params?.log_time) {
        log.build(`Compiling SSR for ${pages.length} pages ...`);
    }

    const tsx_map: GrabTSXModuleBatchMap[] = [];

    try {
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            if (
                params?.target_page_file &&
                page.local_path !== params.target_page_file
            ) {
                continue;
            }

            const { tsx } =
                (await grabPageBundledReactComponent({
                    file_path: page.local_path,
                    return_tsx_only: true,
                })) || {};

            if (!tsx) {
                continue;
            }

            tsx_map.push({
                tsx,
                page_file_path: page.local_path,
            });

            // const component = await grabPageComponent({
            //     file_path: page.local_path,
            //     skip_server_res: true,
            // });
        }

        await grabTsxStringModule({ tsx_map });
    } catch (error) {}

    const elapsed = (performance.now() - buildStart).toFixed(0);

    if (params?.log_time) {
        log.success(`[SSR Compiled] in ${elapsed}ms`);
    }
}
