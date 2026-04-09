import type { GrabPageReactBundledComponentRes } from "../../../types";
import grabPageReactComponentString from "./grab-page-react-component-string";
import grabTsxStringModule from "./grab-tsx-string-module";
import { log } from "../../../utils/log";
import type { FC } from "react";
import grabRootFilePath from "./grab-root-file-path";
import path from "path";
import grabDirNames from "../../../utils/grab-dir-names";

const { ROOT_DIR } = grabDirNames();

type Params = {
    file_path: string;
    return_tsx_only?: boolean;
};

export default async function grabPageBundledReactComponent({
    file_path,
    return_tsx_only,
}: Params): Promise<GrabPageReactBundledComponentRes | undefined> {
    try {
        if (global.SSR_BUNDLER_CTX_MAP?.[file_path]) {
            const mod = await import(
                path.join(ROOT_DIR, global.SSR_BUNDLER_CTX_MAP[file_path].path)
            );

            const Main = mod.default as FC;

            return { component: Main };
        }

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

        const mod: any = await grabTsxStringModule({
            tsx,
            page_file_path: file_path,
        });

        const Main = mod.default as FC;

        return {
            component: Main,
            tsx,
        };
    } catch (error: any) {
        log.error(
            `grabPageBundledReactComponent Error: ${error.message}`,
            error,
        );
        return undefined;
    }
}
