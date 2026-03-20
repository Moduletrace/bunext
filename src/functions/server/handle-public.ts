import type { Server } from "bun";
import grabDirNames from "../../utils/grab-dir-names";
import path from "path";
import isDevelopment from "../../utils/is-development";
import { existsSync } from "fs";

const { PUBLIC_DIR, BUNX_HYDRATION_SRC_DIR } = grabDirNames();

type Params = {
    req: Request;
    server: Server;
};

export default async function ({ req, server }: Params): Promise<Response> {
    try {
        const is_dev = isDevelopment();
        const url = new URL(req.url);

        const file_path = path.join(
            PUBLIC_DIR,
            url.pathname.replace(/^\/public/, ""),
        );

        if (!existsSync(file_path)) {
            return new Response(`Public File Doesn't Exist`, {
                status: 404,
            });
        }

        const file = Bun.file(file_path);

        let res_opts: ResponseInit = {};

        return new Response(file, res_opts);
    } catch (error) {
        return new Response(`Public File Not Found`, {
            status: 404,
        });
    }
}
