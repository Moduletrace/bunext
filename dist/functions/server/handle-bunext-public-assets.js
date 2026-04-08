import grabDirNames from "../../utils/grab-dir-names";
import path from "path";
import isDevelopment from "../../utils/is-development";
import { readFileResponse } from "./handle-public";
const { BUNEXT_PUBLIC_DIR } = grabDirNames();
export default async function ({ req }) {
    try {
        const is_dev = isDevelopment();
        const url = new URL(req.url);
        const file_path = path.join(BUNEXT_PUBLIC_DIR, url.pathname.replace(/\/\.bunext\/public\//, ""));
        if (!file_path.startsWith(BUNEXT_PUBLIC_DIR + path.sep)) {
            return new Response("Forbidden", { status: 403 });
        }
        return readFileResponse({
            file_path,
            cache: url.pathname.includes("/vendor/")
                ? { duration: 3600 }
                : undefined,
        });
    }
    catch (error) {
        return new Response(`File Not Found`, {
            status: 404,
        });
    }
}
