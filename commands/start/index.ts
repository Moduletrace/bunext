import { Command } from "commander";
import grabConfig from "../../functions/grab-config";

export default function () {
    return new Command("start")
        .description("Start production server")
        .action(async () => {
            console.log(`Starting production server ...`);

            const config = await grabConfig();
            global.CONFIG = config;
        });
}
