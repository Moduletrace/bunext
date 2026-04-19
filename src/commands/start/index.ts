import { Command } from "commander";
import path from "path";
import type { BunSpawnOptions } from "../../types";
import writeErrorFile from "../../functions/write-error-file";

let retries = 0;
let timeout: any;
const MAX_RETRIES = 5;

export default function () {
    return new Command("start")
        .description("Start production server")
        .action(async () => {
            await start();
        });
}

async function start() {
    clearTimeout(timeout);

    if (retries >= MAX_RETRIES) {
        console.error(`Production server crashed ${MAX_RETRIES} times. Exiting.`);
        process.exit(1);
    }

    const dev_spawn_file = path.resolve(__dirname, "prod-spawn.ts");

    const spawn_options: BunSpawnOptions = {
        cmd: ["bun", dev_spawn_file],
        stdio: ["inherit", "inherit", "inherit"],
        onExit(subprocess, exitCode, signalCode, error) {
            writeErrorFile({ exitCode, error });
        },
        env: {
            ...process.env,
            NODE_ENV: "production",
        },
    };

    let dev_process = Bun.spawn(spawn_options);

    retries++;

    timeout = setTimeout(() => {
        retries = 0;
    }, 10000);

    const exited = await dev_process.exited;

    if (exited) {
        return await start();
    }
}
