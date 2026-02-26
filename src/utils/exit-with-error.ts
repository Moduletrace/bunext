export default function exitWithError(msg: string, code?: number) {
    console.error(msg);
    process.exit(code || 1);
}
