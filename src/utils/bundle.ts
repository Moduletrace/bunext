import { execSync, type ExecSyncOptions } from "child_process";

type Params = {
    src: string;
    out_dir: string;
    minify?: boolean;
    exec_options?: ExecSyncOptions;
    debug?: boolean;
};

export default function bundle({
    out_dir,
    src,
    minify = true,
    exec_options,
    debug,
}: Params) {
    let cmd = `bun build`;

    cmd += ` ${src} --outdir ${out_dir}`;

    if (minify) {
        cmd += ` --minify`;
    }

    if (debug) {
        console.log("cmd =>", cmd);
    }

    execSync(cmd, {
        stdio: "inherit",
        ...exec_options,
    });
}
