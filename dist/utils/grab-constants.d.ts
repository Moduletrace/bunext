export default function grabConstants(): {
    readonly ClientRootElementIDName: "__bunext";
    readonly ClientWindowPagePropsName: "__PAGE_PROPS__";
    readonly MBInBytes: number;
    readonly ServerDefaultRequestBodyLimitBytes: number;
    readonly ClientRootComponentWindowName: "BUNEXT_ROOT";
    readonly MaxBundlerRebuilds: 5;
    readonly config: import("../types").BunextConfig;
    readonly RouteIgnorePatterns: RegExp[];
};
