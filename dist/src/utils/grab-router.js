import grabDirNames from "./grab-dir-names";
export default function grabRouter() {
    const { PAGES_DIR } = grabDirNames();
    if (process.env.NODE_ENV == "production") {
        return global.ROUTER;
    }
    return new Bun.FileSystemRouter({
        style: "nextjs",
        dir: PAGES_DIR,
    });
}
