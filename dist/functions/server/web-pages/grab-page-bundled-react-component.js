import grabPageReactComponentString from "./grab-page-react-component-string";
import grabTsxStringModule from "./grab-tsx-string-module";
import { log } from "../../../utils/log";
import grabRootFilePath from "./grab-root-file-path";
export default async function grabPageBundledReactComponent({ file_path, return_tsx_only, }) {
    try {
        const { root_file_path } = grabRootFilePath();
        let tsx = grabPageReactComponentString({
            file_path,
            root_file_path,
        });
        if (!tsx) {
            return undefined;
        }
        if (return_tsx_only) {
            return { tsx };
        }
        const mod = await grabTsxStringModule({
            tsx,
            page_file_path: file_path,
        });
        const Main = mod.default;
        return {
            component: Main,
            tsx,
        };
    }
    catch (error) {
        log.error(`grabPageBundledReactComponent Error: ${error.message}`, error);
        return undefined;
    }
}
