import grabAppPort from "./grab-app-port";
export default function grabOrigin() {
    if (global.CONFIG.origin) {
        return global.CONFIG.origin;
    }
    const port = grabAppPort();
    return `http://localhost:${port}`;
}
