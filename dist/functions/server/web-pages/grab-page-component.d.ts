import type { GrabPageComponentRes } from "../../../types";
type Params = {
    req?: Request;
    file_path?: string;
    debug?: boolean;
};
export default function grabPageComponent({ req, file_path: passed_file_path, debug, }: Params): Promise<GrabPageComponentRes>;
export {};
