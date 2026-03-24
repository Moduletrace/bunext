import chalk from "chalk";
import AppNames from "./grab-app-names";
const prefix = {
    info: chalk.bgCyan.bold(" ℹnfo "),
    success: chalk.green.bold("✓"),
    zap: chalk.green.bold("⚡"),
    error: chalk.red.bold("✗"),
    warn: chalk.yellow.bold("⚠"),
    build: chalk.magenta.bold("⚙"),
    watch: chalk.blue.bold("◉"),
};
export const log = {
    info: (msg, log) => {
        console.log(`${prefix.info}  ${chalk.white(msg)}`, log || "");
    },
    success: (msg, log) => {
        console.log(`${prefix.success}  ${chalk.green(msg)}`, log || "");
    },
    error: (msg, log) => console.error(`${prefix.error}  ${chalk.red(String(msg))}`, log || ""),
    warn: (msg, log) => console.warn(`${prefix.warn}  ${chalk.yellow(msg)}`, log || ""),
    build: (msg) => console.log(`${prefix.build}  ${chalk.magenta(msg)}`),
    watch: (msg) => console.log(`${prefix.watch}  ${chalk.blue(msg)}`),
    server: (url) => console.log(`${prefix.success}  ${chalk.white("Server running on")} ${chalk.cyan.underline(url)}`),
    banner: () => console.log(`\n  ${chalk.cyan.bold(AppNames.name)} ${chalk.gray(`v${global.CURRENT_VERSION || AppNames["version"]}`)}\n`),
};
