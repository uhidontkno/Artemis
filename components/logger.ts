const c = require('colors/safe')
export enum loggingLevels {
    Error = 1,
    Warn = 2,
    Info = 3,
    Debug = 4
}
export let logLevel = loggingLevels.Info;
export function debug(...msg:any[]) {
    if (logLevel <= 4) {
        console.log(c.bold(c.brightGray("debug")) + ": " +msg)
    }
}
export function info(...msg:any[]) {
    if (logLevel <= 3) {
        console.log(c.bold(c.brightBlue("info")) + ": " +msg)
    }
}
export function warn(...msg:any[]) {
    if (logLevel <= 2) {
        console.warn(c.bold(c.brightYellow("warn")) + ": " +c.bold(msg))
    }
}
export function error(...msg:any[]) {
    if (logLevel <= 1) {
        console.error(c.bold(c.brightRed("error")) + ": " +c.bold(msg))
    }
}

export default {error,warn,info,debug}