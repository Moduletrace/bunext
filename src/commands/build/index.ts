import { Command } from "commander";
import { log } from "../../utils/log";
import grabDirNames from "../../utils/grab-dir-names";
import { rmSync } from "fs";
import bunextInit from "../../functions/bunext-init";

const { HYDRATION_DST_DIR, BUNX_CWD_PAGES_REWRITE_DIR } = grabDirNames();

export default function () {
    return new Command("build")
        .description("Build Project")
        .action(async () => {
            try {
                rmSync(HYDRATION_DST_DIR, { recursive: true });
                rmSync(BUNX_CWD_PAGES_REWRITE_DIR, { recursive: true });
            } catch (error) {}

            global.SKIPPED_BROWSER_MODULES = new Set<string>();

            await bunextInit({ build_only: true });

            log.success("Modules Built Successfully!");

            process.exit();
        });
}
