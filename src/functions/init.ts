import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import grabDirNames from "../utils/grab-dir-names";
import path from "path";
import grabConfig from "./grab-config";
import type { BunextConfig } from "../types";
import { log } from "../utils/log";

export default async function () {
    const dirNames = grabDirNames();
    const is_dev = !Boolean(process.env.NODE_ENV == "production");

    rmSync(dirNames.BUNEXT_CACHE_DIR, {
        recursive: true,
        force: true,
    });
    rmSync(dirNames.BUNX_CWD_MODULE_CACHE_DIR, {
        recursive: true,
        force: true,
    });

    // try {
    //     const react_package_dir = path.join(
    //         dirNames.ROOT_DIR,
    //         "node_modules",
    //         "react",
    //     );
    //     const react_dom_package_dir = path.join(
    //         dirNames.ROOT_DIR,
    //         "node_modules",
    //         "react-dom",
    //     );

    //     if (
    //         dirNames.ROOT_DIR.startsWith(dirNames.BUNX_ROOT_DIR) &&
    //         !dirNames.ROOT_DIR.includes(`${dirNames.BUNX_ROOT_DIR}/test/`)
    //     ) {
    //         log.error(`Can't Run From this Directory => ${dirNames.ROOT_DIR}`);
    //         process.exit(1);
    //     } else {
    //         rmSync(react_package_dir, { recursive: true });
    //         rmSync(react_dom_package_dir, { recursive: true });
    //     }
    // } catch (error) {}

    try {
        const package_json = await Bun.file(
            path.resolve(__dirname, "../../package.json"),
        ).json();

        const current_version = package_json.version;

        global.CURRENT_VERSION = current_version;
    } catch (error) {}

    const keys = Object.keys(dirNames) as (keyof ReturnType<
        typeof grabDirNames
    >)[];

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const dir = dirNames[key];

        if (!dir.match(/\//)) continue;

        if (!existsSync(dir) && !dir.match(/\.\w+$/)) {
            mkdirSync(dir, { recursive: true });
            continue;
        }

        if (key == "CONFIG_FILE" && !existsSync(dir)) {
            let basicConfig = ``;

            basicConfig += `const config = {};\n`;
            basicConfig += `export default config;\n`;

            writeFileSync(dir, basicConfig);
        }
    }

    const config: BunextConfig = (await grabConfig()) || {};

    global.CONFIG = {
        ...config,
        development: is_dev,
    };
}
