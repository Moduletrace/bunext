import grabDirNames from "./grab-dir-names";

export default function refreshRouter() {
    const { PAGES_DIR } = grabDirNames();

    const router = new Bun.FileSystemRouter({
        style: "nextjs",
        dir: PAGES_DIR,
    });

    global.ROUTER = router;
}
