import grabDirNames from "../../utils/grab-dir-names";
import path from "path";
import isDevelopment from "../../utils/is-development";
import { existsSync } from "fs";
const { PUBLIC_DIR } = grabDirNames();
export default async function ({ req }) {
    try {
        const is_dev = isDevelopment();
        const url = new URL(req.url);
        const file_path = path.join(PUBLIC_DIR, url.pathname);
        if (!existsSync(file_path)) {
            return new Response(`File Doesn't Exist`, {
                status: 404,
            });
        }
        const file = Bun.file(file_path);
        return new Response(file);
    }
    catch (error) {
        return new Response(`File Not Found`, {
            status: 404,
        });
    }
}
