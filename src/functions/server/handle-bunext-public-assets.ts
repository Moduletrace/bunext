import grabDirNames from "../../utils/grab-dir-names";
import path from "path";
import isDevelopment from "../../utils/is-development";
import { existsSync } from "fs";
import { readFileResponse } from "./handle-public";

const { HYDRATION_DST_DIR } = grabDirNames();

type Params = {
    req: Request;
};

export default async function ({ req }: Params): Promise<Response> {
    try {
        const is_dev = isDevelopment();
        const url = new URL(req.url);

        // switch (url.pathname) {
        //     case "/.bunext/react":
        //         return readFileResponse({
        //             file_path: is_dev
        //                 ? global.DIR_NAMES.REACT_DEVELOPMENT_MODULE
        //                 : global.DIR_NAMES.REACT_PRODUCTION_MODULE,
        //         });
        //     case "/.bunext/react-dom":
        //         return readFileResponse({
        //             file_path: is_dev
        //                 ? global.DIR_NAMES.REACT_DOM_DEVELOPMENT_MODULE
        //                 : global.DIR_NAMES.REACT_DOM_PRODUCTION_MODULE,
        //         });
        //     case "/.bunext/react-dom-client":
        //         return readFileResponse({
        //             file_path: is_dev
        //                 ? global.DIR_NAMES.REACT_DOM_CLIENT_DEVELOPMENT_MODULE
        //                 : global.DIR_NAMES.REACT_DOM_CLIENT_PRODUCTION_MODULE,
        //         });
        //     case "/.bunext/react-jsx-runtime":
        //         return readFileResponse({
        //             file_path: is_dev
        //                 ? global.DIR_NAMES.REACT_JSX_RUNTIME_DEVELOPMENT_MODULE
        //                 : global.DIR_NAMES.REACT_JSX_RUNTIME_PRODUCTION_MODULE,
        //         });
        //     case "/.bunext/react-jsx-dev-runtime":
        //         return readFileResponse({
        //             file_path: is_dev
        //                 ? global.DIR_NAMES
        //                       .REACT_JSX_DEVELOPMENT_RUNTIME_DEVELOPMENT_MODULE
        //                 : global.DIR_NAMES
        //                       .REACT_JSX_DEVELOPMENT_RUNTIME_PRODUCTION_MODULE,
        //         });

        //     default:
        //         break;
        // }

        const file_path = path.join(
            HYDRATION_DST_DIR,
            url.pathname.replace(/\/\.bunext\/public\/pages\//, ""),
        );

        if (!file_path.startsWith(HYDRATION_DST_DIR + path.sep)) {
            return new Response("Forbidden", { status: 403 });
        }

        return readFileResponse({ file_path });
    } catch (error) {
        return new Response(`File Not Found`, {
            status: 404,
        });
    }
}
