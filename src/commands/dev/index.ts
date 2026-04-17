import { Command } from "commander";
import path from "path";
import type { BunSpawnOptions } from "../../types";
import grabDirNames from "../../utils/grab-dir-names";
import writeErrorFile from "../../functions/write-error-file";

export default function () {
    return new Command("dev")
        .description("Run development server")
        .action(async () => {
            await dev();
        });
}

async function dev() {
    const dev_spawn_file = path.resolve(__dirname, "dev-spawn.ts");

    const spawn_options: BunSpawnOptions = {
        cmd: ["bun", dev_spawn_file],
        stdio: ["inherit", "inherit", "inherit"],
        onExit(subprocess, exitCode, signalCode, error) {
            writeErrorFile({ exitCode, error });
        },
        env: {
            ...process.env,
            NODE_ENV: "development",
        },
    };

    let dev_process = Bun.spawn(spawn_options);

    const exited = await dev_process.exited;
    if (exited) {
        return await dev();
    }
}
