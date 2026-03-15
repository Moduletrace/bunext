import { readdirSync, statSync, unlinkSync } from "fs";
import grabAllPages from "../../utils/grab-all-pages";
import grabDirNames from "../../utils/grab-dir-names";
import grabPageName from "../../utils/grab-page-name";
import writeWebPageHydrationScript from "../server/web-pages/write-web-page-hydration-script";
import path from "path";
import bundle from "../../utils/bundle";
import AppNames from "../../utils/grab-app-names";
import type { PageFiles } from "../../types";

const { BUNX_HYDRATION_SRC_DIR, HYDRATION_DST_DIR } = grabDirNames();

export default async function allPagesBundler() {
    console.time("build");

    const pages = grabAllPages({ exclude_api: true });

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        if (!isPageValid(page)) {
            continue;
        }

        const pageName = grabPageName({ path: page.local_path });

        writeWebPageHydrationScript({
            pageName,
            page_file: page.local_path,
        });
    }

    const hydration_files = readdirSync(BUNX_HYDRATION_SRC_DIR);

    for (let i = 0; i < hydration_files.length; i++) {
        const hydration_file = hydration_files[i];

        const valid_file = pages.find((p) => {
            if (!isPageValid(p)) {
                return false;
            }

            const pageName = grabPageName({ path: p.local_path });

            const file_tsx_name = `${pageName}.tsx`;
            if (file_tsx_name == hydration_file) {
                return true;
            }
            return false;
        });

        if (!valid_file) {
            unlinkSync(path.join(BUNX_HYDRATION_SRC_DIR, hydration_file));
        }
    }

    const entrypoints = readdirSync(BUNX_HYDRATION_SRC_DIR)
        .filter((f) => f.endsWith(".tsx"))
        .map((f) => path.join(BUNX_HYDRATION_SRC_DIR, f))
        .filter((f) => statSync(f).isFile());

    bundle({
        src: entrypoints.join(" "),
        out_dir: HYDRATION_DST_DIR,
        exec_options: { stdio: "ignore" },
    });

    console.timeEnd("build");
}

function isPageValid(page: PageFiles): boolean {
    if (page.file_name == AppNames["RootPagesComponentName"]) {
        return false;
    }

    if (page.url_path.match(/\(|\)|--/)) {
        return false;
    }

    return true;
}
