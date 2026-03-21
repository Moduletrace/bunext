import { type ExecSyncOptions } from "child_process";
declare const BuildKeys: readonly [{
    readonly key: "production";
}, {
    readonly key: "bytecode";
}, {
    readonly key: "conditions";
}, {
    readonly key: "format";
}, {
    readonly key: "root";
}, {
    readonly key: "splitting";
}, {
    readonly key: "cdd-chunking";
}];
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
export default function bundle({ out_dir, src, minify, exec_options, debug, entry_naming, sourcemap, target, build_options, }: Params): void;
export {};
