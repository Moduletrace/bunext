import type { GrabPageReactBundledComponentRes } from "../../../types";
type Params = {
    file_path: string;
    root_file?: string;
    server_res?: any;
};
export default function grabPageBundledReactComponent({ file_path, root_file, server_res, }: Params): Promise<GrabPageReactBundledComponentRes | undefined>;
export {};
