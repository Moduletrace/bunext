import grabDirNames from "../../utils/grab-dir-names";
import path from "path";
import isDevelopment from "../../utils/is-development";
import { existsSync } from "fs";
import isSafePath from "../../utils/is-safe-path";
const { PUBLIC_DIR } = grabDirNames();
export default async function ({ req }) {
    try {
        const is_dev = isDevelopment();
        const url = new URL(req.url);
        const file_path = path.join(PUBLIC_DIR, url.pathname);
        if (!isSafePath({ filePath: file_path, allowedDir: PUBLIC_DIR })) {
            return new Response("Forbidden", { status: 403 });
        }
        if (!existsSync(file_path)) {
            return new Response(`File Doesn't Exist`, {
                status: 404,
            });
        }
        const file = Bun.file(file_path);
        const headers = new Headers();
        if (!is_dev) {
            headers.set("Cache-Control", "public, max-age=3600");
        }
        return new Response(file, { headers });
    }
    catch (error) {
        return new Response(`File Not Found`, {
            status: 404,
        });
    }
}
