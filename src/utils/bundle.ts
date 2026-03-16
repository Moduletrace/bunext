import plugin from "bun-plugin-tailwind";
import { execSync, type ExecSyncOptions } from "child_process";

const BuildKeys = [
    { key: "production" },
    { key: "bytecode" },
    { key: "conditions" },
    { key: "format" },
    { key: "root" },
    { key: "splitting" },
    { key: "cdd-chunking" },
] as const;

type Params = {
    src: string;
    out_dir: string;
    entry_naming?: string;
    minify?: boolean;
    exec_options?: ExecSyncOptions;
    debug?: boolean;
    sourcemap?: boolean;
    target?: "browser" | "node" | "bun";
    build_options?: {
        [k in (typeof BuildKeys)[number]["key"]]: string | boolean;
    };
};

export default function bundle({
    out_dir,
    src,
    minify = true,
    exec_options,
    debug,
    entry_naming,
    sourcemap,
    target,
    build_options,
}: Params) {
    let cmd = `bun build`;

    if (minify) {
        cmd += ` --minify`;
    }

    if (entry_naming) {
        cmd += ` --entry-naming "${entry_naming}"`;
    }

    if (sourcemap) {
        cmd += ` --sourcemap`;
    }

    if (target) {
        cmd += ` --target ${target}`;
    }

    if (build_options) {
        const keys = Object.keys(build_options);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i] as (typeof BuildKeys)[number]["key"];
            const value = build_options[key];

            if (typeof value == "boolean" && value) {
                cmd += ` --${key}`;
            } else if (key && value) {
                cmd += ` --${key} ${value}`;
            }
        }
    }

    cmd += ` ${src} --outdir ${out_dir}`;

    if (debug) {
        console.log("cmd =>", cmd);
    }

    execSync(cmd, {
        stdio: "inherit",
        ...exec_options,
    });
}
