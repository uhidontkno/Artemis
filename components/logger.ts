const c = require("colors/safe");
export enum loggingLevels {
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
}
export let logLevel = loggingLevels.Info;
export function debug(...msg: any[]) {
  let m = msg.join(" ");
  if (logLevel >= 4) {
    console.log(c.brightGray("debug") + ": " + m);
  }
}
export function info(...msg: any[]) {
  let m = msg.join(" ");
  if (logLevel >= 3) {
    console.log(c.brightBlue("info") + ": " + m);
  }
}
export function warn(...msg: any[]) {
  let m = msg.join(" ");
  if (logLevel >= 2) {
    console.warn(c.brightYellow.bold("warn") + ": " + c.bold(m));
  }
}
export function error(...msg: any[]) {
  let m = msg.join(" ");
  if (logLevel >= 1) {
    console.error(c.brightRed.bold("error") + ": " + c.bold(m));
  }
}

export default { error, warn, info, debug };
