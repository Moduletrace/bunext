import { existsSync, mkdirSync, writeFileSync } from "fs";
import grabDirNames from "../utils/grab-dir-names";
import { execSync } from "child_process";
import path from "path";
import grabConfig from "./grab-config";
import type { BunextConfig } from "../types";

export default async function () {
    const dirNames = grabDirNames();
    const is_dev = !Boolean(process.env.NODE_ENV == "production");

    execSync(`rm -rf ${dirNames.BUNEXT_CACHE_DIR}`);
    execSync(`rm -rf ${dirNames.BUNX_CWD_MODULE_CACHE_DIR}`);

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
