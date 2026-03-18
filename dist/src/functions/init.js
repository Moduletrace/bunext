import { existsSync, mkdirSync, statSync, writeFileSync } from "fs";
import grabDirNames from "../utils/grab-dir-names";
export default async function () {
    const dirNames = grabDirNames();
    const keys = Object.keys(dirNames);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const dir = dirNames[key];
        if (!existsSync(dir) && !dir.match(/\.\w+$/)) {
            mkdirSync(dir, { recursive: true });
            continue;
        }
        if (key == "CONFIG_FILE" && !existsSync(dir)) {
            let basicConfig = ``;
            basicConfig += `const config = {};\n`;
            basicConfig += `export default config;\n`;
            writeFileSync(dir, basicConfig);
        }
    }
}
