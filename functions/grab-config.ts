import { existsSync } from "fs";
import type { BunextConfig } from "../types";
import grabDirNames from "../utils/grab-dir-names";
import exitWithError from "../utils/exit-with-error";

export default async function grabConfig(): Promise<BunextConfig> {
    const { configFile } = grabDirNames();

    if (!existsSync(configFile)) {
        exitWithError(`Config file \`${configFile}\` doesn't exist!`);
    }

    const config = (await import(configFile)).default as BunextConfig;

    if (!config) {
        exitWithError(
            `Config file \`${configFile}\` is invalid! Please provide a valid default export in your config file.`
        );
    }

    return config;
}
