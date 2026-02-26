import grabDirNames from "./grab-dir-names";

export default function grabRouter() {
    const { ROUTES_DIR } = grabDirNames();

    if (process.env.NODE_ENV == "production") {
        return global.ROUTER;
    }

    return new Bun.FileSystemRouter({
        style: "nextjs",
        dir: ROUTES_DIR,
    });
}
