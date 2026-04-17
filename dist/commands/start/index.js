import { Command } from "commander";
import path from "path";
import writeErrorFile from "../../functions/write-error-file";
export default function () {
    return new Command("start")
        .description("Start production server")
        .action(async () => {
        await start();
    });
}
async function start() {
    const dev_spawn_file = path.resolve(__dirname, "prod-spawn.ts");
    const spawn_options = {
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
    const exited = await dev_process.exited;
    if (exited) {
        return await start();
    }
}
