import type { GrabPageReactBundledComponentRes } from "../../../types";
type Params = {
    file_path: string;
    return_tsx_only?: boolean;
};
export default function grabPageBundledReactComponent({ file_path, return_tsx_only, }: Params): Promise<GrabPageReactBundledComponentRes | undefined>;
export {};
