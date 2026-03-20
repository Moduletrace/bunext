import grabDirNames from "../../utils/grab-dir-names";
import { AppData } from "../../data/app-data";
import path from "path";
import grabRootFile from "./web-pages/grab-root-file";
import grabPageBundledReactComponent from "./web-pages/grab-page-bundled-react-component";
import writeHMRTsxModule from "./web-pages/write-hmr-tsx-module";
const { PUBLIC_DIR, BUNX_HYDRATION_SRC_DIR } = grabDirNames();
export default async function ({ req, server }) {
    try {
        const url = new URL(req.url);
        const target_href = url.searchParams.get("href");
        if (!target_href) {
            return new Response(`No HREF passed to /${AppData["ClientHMRPath"]}`, { status: 404 });
        }
        const target_href_url = new URL(target_href);
        const match = global.ROUTER.match(target_href_url.pathname);
        if (!match?.filePath) {
            return new Response(`No pages file matched for this path`, {
                status: 404,
            });
        }
        const out_file = path.join(BUNX_HYDRATION_SRC_DIR, target_href_url.pathname, "index.js");
        const { root_file } = grabRootFile();
        const { tsx } = (await grabPageBundledReactComponent({
            file_path: match.filePath,
            root_file,
        })) || {};
        if (!tsx) {
            throw new Error(`Couldn't grab txt string`);
        }
        const artifact = await writeHMRTsxModule({
            tsx,
            out_file,
        });
        const file = Bun.file(out_file);
        if (await file.exists()) {
            return new Response(file, {
                headers: {
                    "Content-Type": "text/javascript",
                },
            });
        }
        return new Response("Not found", {
            status: 404,
        });
    }
    catch (error) {
        const error_msg = error.message;
        console.error(error_msg);
        return new Response(error_msg || "HMR Error", {
            status: 404,
        });
    }
}
