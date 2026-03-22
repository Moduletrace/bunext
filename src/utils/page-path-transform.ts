import path from "path";
import grabDirNames from "./grab-dir-names";

type Params = {
    page_path: string;
};

const { ROOT_DIR, BUNX_CWD_PAGES_REWRITE_DIR } = grabDirNames();

/**
 * # Transform a page path to the destination
 * path in the .bunext directory
 */
export default function pagePathTransform({ page_path }: Params) {
    const page_path_relative_dir = page_path
        .replace(ROOT_DIR, "")
        .replace(/\/src\/pages/, "");
    const target_path = path.join(
        BUNX_CWD_PAGES_REWRITE_DIR,
        page_path_relative_dir,
    );

    return target_path;
}
