import type { GrabPageReactBundledComponentRes } from "../../../types";
import grabPageReactComponentString from "./grab-page-react-component-string";
import grabTsxStringModule from "./grab-tsx-string-module";

type Params = {
    file_path: string;
    root_file_path?: string;
    server_res?: any;
};

export default async function grabPageBundledReactComponent({
    file_path,
    root_file_path,
    server_res,
}: Params): Promise<GrabPageReactBundledComponentRes | undefined> {
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
        const component = <Main />;

        return {
            component,
            server_res,
            tsx,
        };
    } catch (error: any) {
        return undefined;
    }
}
