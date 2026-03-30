import type { GrabPageComponentRes } from "../../../types";
type Params = {
    req?: Request;
    file_path?: string;
    debug?: boolean;
    return_server_res_only?: boolean;
};
export default function grabPageComponent({ req, file_path: passed_file_path, debug, return_server_res_only, }: Params): Promise<GrabPageComponentRes>;
export {};
