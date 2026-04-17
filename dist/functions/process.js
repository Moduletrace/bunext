import { spawn } from "bun";
// Only the "supervisor" respawns. The child sets this env var so it won't respawn itself.
const IS_CHILD = process.env.__RESPAWN_CHILD === "1";
let shuttingDown = false;
async function cleanup() {
    // Put real cleanup here: close DB handles, servers, file descriptors, timers, etc.
    // Must be awaitable — do NOT rely on process.on("exit") for this.
}
function respawn(code) {
    const child = spawn({
        cmd: [process.execPath, ...process.argv.slice(1)],
        stdio: ["inherit", "inherit", "inherit"],
        env: { ...process.env, __RESPAWN_CHILD: "1" },
        // Detach so the child survives independently and gets its own process group.
        // Without this, killing the parent's group can take the child with it.
    });
    // Let the child live on its own.
    child.unref?.();
}
async function shutdown(code) {
    if (shuttingDown)
        return;
    shuttingDown = true;
    try {
        await cleanup();
    }
    catch (e) {
        console.error("cleanup failed:", e);
    }
    // Only the supervisor respawns, and only on abnormal exit.
    if (!IS_CHILD && code !== 0) {
        respawn(code);
    }
    process.exit(code);
}
// Catch the things that actually fire *before* exit, where async works.
process.on("SIGINT", () => shutdown(130));
process.on("SIGTERM", () => shutdown(143));
process.on("uncaughtException", (err) => {
    console.error(err);
    shutdown(1);
});
process.on("unhandledRejection", (err) => {
    console.error(err);
    shutdown(1);
});
