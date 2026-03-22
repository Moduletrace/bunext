import chalk from "chalk";
import AppNames from "./grab-app-names";

const prefix = {
    info: chalk.bgCyan.bold(" ℹnfo "),
    success: chalk.green.bold("✓"),
    error: chalk.red.bold("✗"),
    warn: chalk.yellow.bold("⚠"),
    build: chalk.magenta.bold("⚙"),
    watch: chalk.blue.bold("◉"),
};

export const log = {
    info: (msg: string, log?: any) => {
        console.log(`${prefix.info}  ${chalk.white(msg)}`, log || "");
    },
    success: (msg: string, log?: any) => {
        console.log(`${prefix.success}  ${chalk.green(msg)}`, log || "");
    },
    error: (msg: string | Error, log?: any) =>
        console.error(`${prefix.error}  ${chalk.red(String(msg))}`, log || ""),
    warn: (msg: string) => console.warn(`${prefix.warn}  ${chalk.yellow(msg)}`),
    build: (msg: string) =>
        console.log(`${prefix.build}  ${chalk.magenta(msg)}`),
    watch: (msg: string) => console.log(`${prefix.watch}  ${chalk.blue(msg)}`),
    server: (url: string) =>
        console.log(
            `${prefix.success}  ${chalk.white("Server running on")} ${chalk.cyan.underline(url)}`,
        ),
    banner: () =>
        console.log(
            `\n  ${chalk.cyan.bold(AppNames.name)} ${chalk.gray(`v${global.CURRENT_VERSION || AppNames["version"]}`)}\n`,
        ),
};
