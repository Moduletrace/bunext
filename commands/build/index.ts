import { Command } from "commander";
import grabConfig from "../../functions/grab-config";

export default function () {
    return new Command("build")
        .description("Build project")
        .action(async () => {
            console.log(`Building project ...`);

            const config = await grabConfig();
            global.CONFIG = config;
        });
}
