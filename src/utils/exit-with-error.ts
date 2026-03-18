import { log } from "./log";

export default function exitWithError(msg: string, code?: number) {
    log.error(msg);
    process.exit(code || 1);
}
