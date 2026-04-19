import grabDirNames from "../../utils/grab-dir-names";
import path from "path";
import isDevelopment from "../../utils/is-development";
import { existsSync } from "fs";
import isSafePath from "../../utils/is-safe-path";

const { PUBLIC_DIR } = grabDirNames();

type Params = {
    req: Request;
};

export default async function ({ req }: Params): Promise<Response> {
    try {
        const is_dev = isDevelopment();
        const url = new URL(req.url);

        const file_path = path.join(
            PUBLIC_DIR,
            url.pathname.replace(/^\/public/, ""),
        );

        if (!isSafePath({ filePath: file_path, allowedDir: PUBLIC_DIR })) {
            return new Response("Forbidden", { status: 403 });
        }

        return readFileResponse({ file_path });
    } catch (error) {
        return new Response(`Public File Not Found`, {
            status: 404,
        });
    }
}

type FileResponse = {
    file_path: string;
    cache?: {
        duration?: "infinite" | number;
    };
};

export function readFileResponse({ file_path, cache }: FileResponse) {
    if (!existsSync(file_path)) {
        return new Response(`Public File Doesn't Exist`, {
            status: 404,
        });
    }

    const file = Bun.file(file_path);

    const headers = new Headers();

    if (cache?.duration == "infinite" || (cache && !cache.duration)) {
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else if (cache?.duration) {
        headers.set("Cache-Control", `public, max-age=${cache.duration}`);
    } else if (!isDevelopment()) {
        headers.set("Cache-Control", "public, max-age=3600");
    }

    return new Response(file, {
        headers,
    });
}
