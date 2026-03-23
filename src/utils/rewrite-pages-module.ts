import grabAllPages from "./grab-all-pages";
import pagePathTransform from "./page-path-transform";
import stripServerSideLogic from "../functions/bundler/strip-server-side-logic";
import grabRootFilePath from "../functions/server/web-pages/grab-root-file-path";
import { existsSync } from "fs";

type Params = {
    page_file_path?: string | string[];
};

export default async function rewritePagesModule(params?: Params) {
    const { page_file_path } = params || {};
    let target_pages: string[] | undefined;

    if (page_file_path) {
        target_pages = Array.isArray(page_file_path)
            ? page_file_path
            : [page_file_path];
    } else {
        const pages = grabAllPages({ exclude_api: true });
        target_pages = pages.map((p) => p.local_path);
    }

    for (let i = 0; i < target_pages.length; i++) {
        const page_path = target_pages[i];
        await transformFile(page_path);
    }

    const { root_file_path } = grabRootFilePath();

    if (root_file_path && existsSync(root_file_path)) {
        await transformFile(root_file_path);
    }
}

async function transformFile(page_path: string) {
    const dst_path = pagePathTransform({ page_path });

    const origin_page_content = await Bun.file(page_path).text();
    const dst_page_content = stripServerSideLogic({
        txt_code: origin_page_content,
        file_path: page_path,
    });

    await Bun.write(dst_path, dst_page_content, {
        createPath: true,
    });
}
