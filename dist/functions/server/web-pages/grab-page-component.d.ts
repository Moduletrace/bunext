import type { GrabPageComponentRes } from "../../../types";
type Params = {
    req?: Request;
    file_path?: string;
    debug?: boolean;
    retry?: boolean;
    return_server_res_only?: boolean;
    skip_server_res?: boolean;
};
export default function grabPageComponent(params: Params): Promise<GrabPageComponentRes>;
export {};
