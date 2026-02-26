import { existsSync } from "fs";
import type { BunextConfig } from "../types";
import grabDirNames from "../utils/grab-dir-names";
import exitWithError from "../utils/exit-with-error";

export default async function grabConfig(): Promise<BunextConfig | undefined> {
    try {
        const { CONFIG_FILE } = grabDirNames();

        if (!existsSync(CONFIG_FILE)) {
            exitWithError(`Config file \`${CONFIG_FILE}\` doesn't exist!`);
        }

        const config = (await import(CONFIG_FILE)).default as BunextConfig;

        if (!config) {
            exitWithError(
                `Config file \`${CONFIG_FILE}\` is invalid! Please provide a valid default export in your config file.`
            );
        }

        return config;
    } catch (error) {
        return undefined;
    }
}
