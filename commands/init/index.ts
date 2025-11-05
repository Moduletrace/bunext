import { Command } from "commander";
import AppNames from "../../utils/grab-app-names";

export default function () {
    return new Command("init")
        .description("Initialize project")
        .action(async () => {
            console.log(`Initializing ${AppNames.name} ...`);
        });
}
