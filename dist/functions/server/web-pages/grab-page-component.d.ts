import type { GrabPageComponentRes } from "../../../types";
type Params = {
    req?: Request;
    file_path?: string;
    debug?: boolean;
    return_server_res_only?: boolean;
    skip_server_res?: boolean;
};
export default function grabPageComponent({ req, file_path: passed_file_path, debug, return_server_res_only, skip_server_res, }: Params): Promise<GrabPageComponentRes>;
export {};
