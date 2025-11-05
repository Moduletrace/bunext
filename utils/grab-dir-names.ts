import path from "path";

type Params = {
    dir?: string;
};

export default function grabDirNames(params?: Params) {
    const rootDir = params?.dir || process.cwd();
    const appDir = path.resolve(__dirname, "..");
    const entrypoint = path.join(
        appDir,
        "functions",
        "server",
        "start-server.ts"
    );

    const pagesDir = path.join(rootDir, "pages");
    const componentsDir = path.join(rootDir, "components");
    const publicDir = path.join(rootDir, "public");
    const stylesDir = path.join(rootDir, "styles");
    const utilsDir = path.join(rootDir, "utils");
    const typesDir = path.join(rootDir, "types");
    const configFile = path.join(rootDir, "bunext.config.ts");

    return {
        rootDir,
        pagesDir,
        componentsDir,
        publicDir,
        stylesDir,
        utilsDir,
        typesDir,
        configFile,
        appDir,
        entrypoint,
    };
}
