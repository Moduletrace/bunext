export default function grabConstants() {
    const config = global.CONFIG;
    const MB_IN_BYTES = 1024 * 1024;
    const ClientWindowPagePropsName = "__PAGE_PROPS__";
    const ClientRootElementIDName = "__bunext";
    const ClientRootComponentWindowName = "BUNEXT_ROOT";
    const ServerDefaultRequestBodyLimitBytes = MB_IN_BYTES * 10;
    const MaxBundlerRebuilds = 5;
    return {
        ClientRootElementIDName,
        ClientWindowPagePropsName,
        MBInBytes: MB_IN_BYTES,
        ServerDefaultRequestBodyLimitBytes,
        ClientRootComponentWindowName,
        MaxBundlerRebuilds,
        config,
    };
}
