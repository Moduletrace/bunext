import path from "path";

export default function grabDirNames() {
    const ROOT_DIR = process.cwd();
    const SRC_DIR = path.join(ROOT_DIR, "src");
    const ROUTES_DIR = path.join(SRC_DIR, "routes");
    const API_DIR = path.join(ROUTES_DIR, "api");
    const PUBLIC_DIR = path.join(ROOT_DIR, "public");
    const HYDRATION_DST_DIR = path.join(PUBLIC_DIR, "routes");
    const CONFIG_FILE = path.join(ROOT_DIR, "bunext.config.ts");

    const BUNX_CWD_DIR = path.resolve(ROOT_DIR, ".bunext");
    const BUNX_TMP_DIR = path.resolve(BUNX_CWD_DIR, ".tmp");
    const BUNX_HYDRATION_SRC_DIR = path.resolve(
        BUNX_CWD_DIR,
        "client",
        "hydration-src"
    );

    const BUNX_ROOT_DIR = path.resolve(__dirname, "../../");

    return {
        ROOT_DIR,
        SRC_DIR,
        ROUTES_DIR,
        API_DIR,
        PUBLIC_DIR,
        HYDRATION_DST_DIR,
        BUNX_ROOT_DIR,
        CONFIG_FILE,
        BUNX_TMP_DIR,
        BUNX_HYDRATION_SRC_DIR,
    };
}

// const rootDir = params?.dir || process.cwd();
//     const appDir = path.resolve(__dirname, "..");
//     const entrypoint = path.join(
//         appDir,
//         "functions",
//         "server",
//         "start-server.ts"
//     );

//     const bunextDir = path.join(rootDir, ".bunext");
//     const bunextClientDir = path.join(bunextDir, "client");
//     const bunextClientRoutesDir = path.join(bunextClientDir, "routes");
//     const bunextClientRoutesSrcDir = path.join(bunextClientRoutesDir, "src");
//     const bunextClientRoutesDstDir = path.join(bunextClientRoutesDir, "dst");

//     const bunextServerDir = path.join(bunextDir, "server");
//     const bunextServerPagesDir = path.join(bunextServerDir, "pages");

//     const publicDir = path.join(rootDir, "public");
//     const configFile = path.join(rootDir, "bunext.config.ts");

//     const srcDir = path.join(rootDir, "src");
//     const pagesDir = path.join(srcDir, "pages");
//     const componentsDir = path.join(srcDir, "components");
//     const stylesDir = path.join(srcDir, "styles");
//     const utilsDir = path.join(srcDir, "utils");
//     const typesDir = path.join(srcDir, "types");

//     return {
//         rootDir,
//         pagesDir,
//         componentsDir,
//         publicDir,
//         stylesDir,
//         utilsDir,
//         typesDir,
//         configFile,
//         appDir,
//         entrypoint,
//         srcDir,
//         bunextDir,
//         bunextClientDir,
//         bunextClientRoutesDir,
//         bunextClientRoutesSrcDir,
//         bunextClientRoutesDstDir,
//         bunextServerDir,
//         bunextServerPagesDir,
//     };
