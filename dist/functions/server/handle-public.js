import grabDirNames from "../../utils/grab-dir-names";
import path from "path";
import isDevelopment from "../../utils/is-development";
import { existsSync } from "fs";
const { PUBLIC_DIR } = grabDirNames();
export default async function ({ req }) {
    try {
        const is_dev = isDevelopment();
        const url = new URL(req.url);
        const file_path = path.join(PUBLIC_DIR, url.pathname.replace(/^\/public/, ""));
        if (!file_path.startsWith(PUBLIC_DIR + path.sep)) {
            return new Response("Forbidden", { status: 403 });
        }
        return readFileResponse({ file_path });
    }
    catch (error) {
        return new Response(`Public File Not Found`, {
            status: 404,
        });
    }
}
export function readFileResponse({ file_path }) {
    if (!existsSync(file_path)) {
        return new Response(`Public File Doesn't Exist`, {
            status: 404,
        });
    }
    const file = Bun.file(file_path);
    // let res_opts: ResponseInit = {};
    return new Response(file);
}
