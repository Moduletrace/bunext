import { execSync } from "child_process";
export default function bundle({ out_dir, src, minify = true, exec_options, debug, }) {
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
