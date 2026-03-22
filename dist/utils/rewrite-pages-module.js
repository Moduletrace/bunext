import grabAllPages from "./grab-all-pages";
import pagePathTransform from "./page-path-transform";
import stripServerSideLogic from "../functions/bundler/strip-server-side-logic";
export default async function rewritePagesModule(params) {
    const { page_url } = params || {};
    let target_pages;
    if (page_url) {
        target_pages = Array.isArray(page_url) ? page_url : [page_url];
    }
    else {
        const pages = grabAllPages({ exclude_api: true });
        target_pages = pages.map((p) => p.local_path);
    }
    for (let i = 0; i < target_pages.length; i++) {
        const page_path = target_pages[i];
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
}
