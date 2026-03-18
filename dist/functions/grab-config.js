import { existsSync } from "fs";
import grabDirNames from "../utils/grab-dir-names";
import exitWithError from "../utils/exit-with-error";
export default async function grabConfig() {
    try {
        const { CONFIG_FILE } = grabDirNames();
        if (!existsSync(CONFIG_FILE)) {
            exitWithError(`Config file \`${CONFIG_FILE}\` doesn't exist!`);
        }
        const config = (await import(CONFIG_FILE)).default;
        if (!config) {
            exitWithError(`Config file \`${CONFIG_FILE}\` is invalid! Please provide a valid default export in your config file.`);
        }
        return config;
    }
    catch (error) {
        return undefined;
    }
}
