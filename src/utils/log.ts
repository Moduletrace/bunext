import chalk from "chalk";
import AppNames from "./grab-app-names";

const prefix = {
    info: chalk.cyan.bold("ℹ"),
    success: chalk.green.bold("✓"),
    error: chalk.red.bold("✗"),
    warn: chalk.yellow.bold("⚠"),
    build: chalk.magenta.bold("⚙"),
    watch: chalk.blue.bold("◉"),
};

export const log = {
    info: (msg: string) =>
        console.log(`${prefix.info}  ${chalk.white(msg)}`),
    success: (msg: string) =>
        console.log(`${prefix.success}  ${chalk.green(msg)}`),
    error: (msg: string | Error) =>
        console.error(`${prefix.error}  ${chalk.red(String(msg))}`),
    warn: (msg: string) =>
        console.warn(`${prefix.warn}  ${chalk.yellow(msg)}`),
    build: (msg: string) =>
        console.log(`${prefix.build}  ${chalk.magenta(msg)}`),
    watch: (msg: string) =>
        console.log(`${prefix.watch}  ${chalk.blue(msg)}`),
    server: (url: string) =>
        console.log(
            `${prefix.success}  ${chalk.white("Server running on")} ${chalk.cyan.underline(url)}`,
        ),
    banner: () =>
        console.log(
            `\n  ${chalk.cyan.bold(AppNames.name)} ${chalk.gray(`v${AppNames.version}`)}\n`,
        ),
};
