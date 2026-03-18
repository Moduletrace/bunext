import { existsSync, readdirSync, statSync } from "fs";
import grabDirNames from "./grab-dir-names";
import path from "path";
import AppNames from "./grab-app-names";
export default function grabAllPages(params) {
    const { PAGES_DIR } = grabDirNames();
    const pages = grabPageDirRecursively({ page_dir: PAGES_DIR });
    if (params?.exclude_api) {
        return pages.filter((p) => !Boolean(p.url_path.startsWith("/api/")));
    }
    return pages;
}
function grabPageDirRecursively({ page_dir }) {
    const pages = readdirSync(page_dir);
    const pages_files = [];
    const root_pages_file = grabPageFileObject({ file_path: `` });
    if (root_pages_file) {
        pages_files.push(root_pages_file);
    }
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const full_page_path = path.join(page_dir, page);
        if (!existsSync(full_page_path)) {
            continue;
        }
        if (page.match(new RegExp(`${AppNames["RootPagesComponentName"]}`))) {
            continue;
        }
        if (page.match(/\(|\)|--/)) {
            continue;
        }
        const page_stat = statSync(full_page_path);
        if (page_stat.isDirectory()) {
            if (page.match(/\(|\)/))
                continue;
            const new_page_files = grabPageDirRecursively({
                page_dir: full_page_path,
            });
            pages_files.push(...new_page_files);
        }
        else if (page.match(/\.(ts|js)x?$/)) {
            const pages_file = grabPageFileObject({
                file_path: full_page_path,
            });
            if (pages_file) {
                pages_files.push(pages_file);
            }
        }
    }
    return pages_files;
}
function grabPageFileObject({ file_path, }) {
    let url_path = file_path
        .replace(/.*\/pages\//, "/")
        ?.replace(/\.(ts|js)x?$/, "");
    let file_name = url_path.split("/").pop();
    if (!file_name)
        return;
    return {
        local_path: file_path,
        url_path,
        file_name,
    };
}
