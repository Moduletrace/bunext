import { Command } from "commander";
import path from "path";
import writeErrorFile from "../../functions/write-error-file";
import { existsSync } from "fs";
let retries = 0;
let timeout;
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
    const prod_spawn_file = path.resolve(__dirname, "prod-spawn.ts");
    const prod_spawn_js_file = path.resolve(__dirname, "prod-spawn.js");
    const final_spawn_file = existsSync(prod_spawn_js_file)
        ? prod_spawn_js_file
        : prod_spawn_file;
    const spawn_options = {
        cmd: ["bun", final_spawn_file],
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
