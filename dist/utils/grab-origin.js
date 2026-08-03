import grabAppPort from "./grab-app-port";
export default function grabOrigin() {
    if (global.BUNEXT_CONFIG.origin) {
        return global.BUNEXT_CONFIG.origin;
    }
    const port = grabAppPort();
    return `http://localhost:${port}`;
}
