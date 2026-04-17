import path from "path";
import { mkdirSync, writeFileSync } from "fs";
import grabDirNames from "../utils/grab-dir-names";
const { BUNX_BUNDLER_ERROR_EXIT_FILE } = grabDirNames();
export default function writeErrorFile({ exitCode, error, }) {
    let txt = ``;
    txt += `Bunext Error\n`;
    txt += `============================================\n`;
    txt += `ERROR: ${error?.message}\n`;
    txt += `EXIT_CODE: ${exitCode || 0}\n`;
    txt += `CALL_STACK: ${error?.stack}\n`;
    mkdirSync(path.dirname(BUNX_BUNDLER_ERROR_EXIT_FILE), { recursive: true });
    writeFileSync(BUNX_BUNDLER_ERROR_EXIT_FILE, txt);
}
// log.info("Running development server ...");
// try {
//     rmSync(HYDRATION_DST_DIR, { recursive: true });
//     rmSync(BUNX_CWD_PAGES_REWRITE_DIR, { recursive: true });
// } catch (error) {}
// await bunextInit();
// await startServer();
