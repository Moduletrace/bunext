import { jsx as _jsx } from "react/jsx-runtime";
import grabPageReactComponentString from "./grab-page-react-component-string";
import grabTsxStringModule from "./grab-tsx-string-module";
export default async function grabPageBundledReactComponent({ file_path, root_file_path, server_res, }) {
    try {
        let tsx = grabPageReactComponentString({
            file_path,
            root_file_path,
            server_res,
        });
        if (!tsx) {
            return undefined;
        }
        const mod = await grabTsxStringModule({ tsx, file_path });
        const Main = mod.default;
        const component = _jsx(Main, {});
        return {
            component,
            server_res,
            tsx,
        };
    }
    catch (error) {
        return undefined;
    }
}
