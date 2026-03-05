import { watch } from "fs";
import grabDirNames from "../../utils/grab-dir-names";
import grabPageName from "../../utils/grab-page-name";
import path from "path";
import { execSync } from "child_process";
import serverParamsGen from "./server-params-gen";

const { ROOT_DIR, BUNX_HYDRATION_SRC_DIR, HYDRATION_DST_DIR, ROUTES_DIR } =
    grabDirNames();

export default function watcher() {
    watch(
        ROOT_DIR,
        { recursive: true, persistent: true },
        async (event, filename) => {
            if (global.RECOMPILING) return;
            if (!filename) return;
            if (filename.match(/ /)) return;
            if (filename.match(/^node_modules\//)) return;
            if (filename.match(/\.bunext|\/public\//)) return;

            if (filename.match(/\/routes\//)) {
                if (event == "change") {
                    clearTimeout(global.WATCHER_TIMEOUT);

                    global.RECOMPILING = true;

                    const fullPath = path.join(ROOT_DIR, filename);

                    const pageName = grabPageName({ path: fullPath });

                    // const router = grabRouter();
                    // const match = router.match(fullPath);

                    // if (match?.filePath) {
                    //     const module = await import(match.filePath);

                    //     const serverRes = await (async () => {
                    //         try {
                    //             return await module["server"]();
                    //         } catch (error) {
                    //             return {};
                    //         }
                    //     })();

                    //     const Component = module.default as FC<any>;
                    //     const component = <Component pageProps={serverRes} />;

                    //     await writeWebPageHydrationScript({
                    //         pageName,
                    //         component,
                    //     });
                    // }

                    // await Bun.build({
                    //     entrypoints: [
                    //         `${BUNX_HYDRATION_SRC_DIR}/${pageName}.tsx`,
                    //     ],
                    //     outdir: HYDRATION_DST_DIR,
                    //     minify: true,
                    // });

                    let cmd = `bun build`;
                    cmd += ` ${BUNX_HYDRATION_SRC_DIR}/${pageName}.tsx --outdir ${HYDRATION_DST_DIR}`;
                    cmd += ` --minify`;
                    // cmd += ` && bun pm cache rm`;

                    execSync(cmd, { stdio: "inherit" });

                    global.ROUTER = new Bun.FileSystemRouter({
                        style: "nextjs",
                        dir: ROUTES_DIR,
                    });

                    const encoder = new TextEncoder();
                    const msg = encoder.encode(
                        `event: update\ndata: reload\n\n`,
                    );

                    for (const controller of global.HMR_CONTROLLERS) {
                        controller.enqueue(msg.toString());
                    }

                    // Let the SSE event flush before restarting the server.
                    // The server restart is required to clear Bun's module cache
                    // so the next request renders the updated route, not the
                    // stale cached module (which causes a hydration mismatch).
                    // await Bun.sleep(500);

                    // await reloadServer();
                    global.RECOMPILING = false;
                } else if (event == "rename") {
                    await reloadServer();
                }
            } else if (filename.match(/\.(js|ts|tsx|jsx)$/)) {
                clearTimeout(global.WATCHER_TIMEOUT);
                await reloadServer();
            }
        },
    );

    // watch(BUNX_HYDRATION_SRC_DIR, async (event, filename) => {
    //     if (!filename) return;

    //     const targetFile = path.join(BUNX_HYDRATION_SRC_DIR, filename);

    //     await Bun.build({
    //         entrypoints: [targetFile],
    //         outdir: HYDRATION_DST_DIR,
    //         minify: true,
    //         target: "browser",
    //         format: "esm",
    //     });

    //     global.SERVER?.publish("__bun_hmr", "update");

    //     setTimeout(() => {
    //         global.RECOMPILING = false;
    //     }, 200);
    // });

    // watch(HYDRATION_DST_DIR, async (event, filename) => {
    //     const encoder = new TextEncoder();
    //     global.HMR_CONTROLLER?.enqueue(encoder.encode(`event: update\ndata: reload\n\n`));
    //     global.RECOMPILING = false;
    // });

    // let cmd = `bun build`;

    // cmd += ` ${BUNX_HYDRATION_SRC_DIR}/*.tsx --outdir ${HYDRATION_DST_DIR}`;
    // cmd += ` --watch --minify`;

    // execSync(cmd, { stdio: "inherit" });
}

async function reloadServer() {
    const serverParams = await serverParamsGen();

    console.log(`Reloading Server ...`);

    global.SERVER?.stop();
    global.SERVER = Bun.serve(serverParams);
}
