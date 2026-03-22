import type { GrabPageReactBundledComponentRes } from "../../../types";
type Params = {
    file_path: string;
    root_file_path?: string;
    server_res?: any;
};
export default function grabPageBundledReactComponent({ file_path, root_file_path, server_res, }: Params): Promise<GrabPageReactBundledComponentRes | undefined>;
export {};
