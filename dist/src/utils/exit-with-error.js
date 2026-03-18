export default function exitWithError(msg, code) {
    console.error(msg);
    process.exit(code || 1);
}
