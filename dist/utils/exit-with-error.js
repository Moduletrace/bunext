import { log } from "./log";
export default function exitWithError(msg, code) {
    log.error(msg);
    process.exit(code || 1);
}
