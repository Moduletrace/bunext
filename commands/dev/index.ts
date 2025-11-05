import { Command } from "commander";
import grabConfig from "../../functions/grab-config";
import grabDirNames from "../../utils/grab-dir-names";
import AppNames from "../../utils/grab-app-names";

export default function () {
    return new Command("dev")
        .description("Run development server")
        .action(async () => {
            console.log(`Running development server ...`);

            const config = await grabConfig();
            global.CONFIG = config;

            const { entrypoint } = grabDirNames();
            const { defaultDistDir } = AppNames;

            let buildCmd = ["bun"];

            buildCmd.push(
                "build",
                entrypoint,
                "--outdir",
                config.distDir || defaultDistDir,
                "--watch"
            );

            const spawnedProcess = Bun.spawn({
                cmd: buildCmd,
            });

            const exitCode = await spawnedProcess.exited;

            // Bun.build({
            //     entrypoints: [entrypoint],
            //     outdir: config.distDir || defaultDistDir,
            //     minify: true,
            // });

            // await startServer();
        });
}
