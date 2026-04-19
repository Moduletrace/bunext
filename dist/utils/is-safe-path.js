import { realpathSync } from "fs";
import path from "path";
export default function isSafePath({ filePath, allowedDir, }) {
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(allowedDir + path.sep) && resolved !== allowedDir) {
        return false;
    }
    try {
        const real = realpathSync(resolved);
        return (real.startsWith(allowedDir + path.sep) || real === allowedDir);
    }
    catch {
        return false;
    }
}
