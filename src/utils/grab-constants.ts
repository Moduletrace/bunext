import path from "path";
import grabConfig from "../functions/grab-config";

export default async function grabConstants() {
    const config = await grabConfig();
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
    } as const;
}
