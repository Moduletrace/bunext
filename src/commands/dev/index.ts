import { Command } from "commander";
import path from "path";
import type { BunSpawnOptions } from "../../types";
import grabDirNames from "../../utils/grab-dir-names";
import writeErrorFile from "../../functions/write-error-file";

let retries = 0;
let timeout: any;
const MAX_RETRIES = 5;

export default function () {
    return new Command("dev")
        .description("Run development server")
        .action(async () => {
            await dev();
        });
}

async function dev() {
    clearTimeout(timeout);

    if (retries >= MAX_RETRIES) {
        console.error(`Dev server crashed ${MAX_RETRIES} times. Exiting.`);
        process.exit(1);
    }

    const dev_spawn_file = path.resolve(__dirname, "dev-spawn.ts");

    const spawn_options: BunSpawnOptions = {
        cmd: ["bun", dev_spawn_file],
        stdio: ["inherit", "inherit", "inherit"],
        async onExit(subprocess, exitCode, signalCode, error) {
            writeErrorFile({ exitCode, error });
        },
        env: {
            ...process.env,
            NODE_ENV: "development",
        },
    };

    let dev_process = Bun.spawn(spawn_options);

    retries++;

    timeout = setTimeout(() => {
        retries = 0;
    }, 10000);

    const exited = await dev_process.exited;
    if (exited) {
        return await dev();
    }
}
