import { existsSync, readdirSync, statSync } from "fs";
import grabDirNames from "./grab-dir-names";
import path from "path";
import AppNames from "./grab-app-names";
import checkExcludedPatterns from "./check-excluded-patterns";
export default function grabAllPages(params) {
    const { PAGES_DIR } = grabDirNames();
    const pages = grabPageDirRecursively({
        page_dir: PAGES_DIR,
        include_server: params?.include_server,
    });
    if (params?.exclude_api) {
        return pages.filter((p) => !Boolean(p.url_path.startsWith("/api/")));
    }
    if (params?.api_only) {
        return pages.filter((p) => Boolean(p.url_path.startsWith("/api/")));
    }
    return pages;
}
function grabPageDirRecursively({ page_dir, include_server, }) {
    const pages = readdirSync(page_dir);
    const pages_files = [];
    const root_pages_file = grabPageFileObject({ file_path: `` });
    if (root_pages_file) {
        pages_files.push(root_pages_file);
    }
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const page_name = page.split("/").pop();
        const full_page_path = path.join(page_dir, page);
        if (!existsSync(full_page_path) || !page_name) {
            continue;
        }
        if (page.match(new RegExp(`${AppNames["RootPagesComponentName"]}`)) &&
            !page_name.match(/\.server\.tsx?/)) {
            continue;
        }
        const is_page_excluded = checkExcludedPatterns({
            path: full_page_path,
        });
        if (is_page_excluded) {
            continue;
        }
        if (full_page_path.match(/__tests__/)) {
            continue;
        }
        if (page_name.match(/\.test\.(t|j)sx?/)) {
            continue;
        }
        if (page_name.match(/\.server\.tsx?/) && !include_server) {
            continue;
        }
        const page_stat = statSync(full_page_path);
        if (page_stat.isDirectory()) {
            if (checkExcludedPatterns({ path: full_page_path }))
                continue;
            const new_page_files = grabPageDirRecursively({
                page_dir: full_page_path,
                include_server,
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
    return pages_files.sort((a, b) => {
        if (a.url_path === "/index")
            return -1;
        if (b.url_path === "/index")
            return 1;
        return 0;
    });
}
function grabPageFileObject({ file_path, }) {
    let url_path = file_path
        .replace(/.*\/pages\//, "/")
        ?.replace(/\.(ts|js)x?$/, "");
    let file_name = url_path.split("/").pop();
    if (!file_name)
        return;
    // const transformed_path = pagePathTransform({ page_path: file_path });
    return {
        local_path: file_path,
        url_path,
        file_name,
    };
}
