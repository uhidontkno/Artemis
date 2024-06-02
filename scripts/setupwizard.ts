const c = require("colors/safe");
import ansi from 'ansi-escapes';
import * as readline from 'node:readline/promises';  // This uses the promise-based APIs
import { stdin as input, stdout as output } from 'node:process';
const p = require('prompt')
import * as tty from 'tty';
function secretPrompt(query: string): Promise<string> {
    return new Promise((resolve) => {
      // Save original settings
      const stdin = process.stdin;
      const stdout = process.stdout;
      
      // Set raw mode and turn off echo
      if (stdin.isTTY) {
        (stdin as tty.ReadStream).setRawMode(true);
      }
      stdin.setEncoding('utf8');
      stdin.resume();
      
      let input = '';
      stdout.write(query);
      
      stdin.on('data', (ch:any) => {
        ch = ch.toString();
        switch (ch) {
          case '\n':
          case '\r':
          case '\u0004':
            // Enter, return, or Ctrl-d
            (stdin as tty.ReadStream).setRawMode(false);
            stdin.pause();
            stdout.write('\n');
            resolve(input);
            break;
          case '\u0003':
            // Ctrl-c
            (stdin as tty.ReadStream).setRawMode(false);
            stdin.pause();
            stdout.write('\n');
            process.exit();
            break;
          default:
            // Append character to input and hide it from the terminal
            input += ch;
            break;
        }
      });
    });
  }
function timeout(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const copyFile = async (fp:string | URL,dfp:string | URL) => await Bun.write(Bun.file(dfp),await Bun.file(fp).text())

async function prompt(ask:string) {
    const rl = readline.createInterface({ input, output });
    let res = await rl.question(ask);
    rl.close();
    return res;
}


console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");

console.clear();

console.log(`${c.bold(c.blue("Artemis"))} ${c.blue("Setup Wizard")}`)
if (process.argv0 != "bun") {
    console.log(`${c.bold(c.red("error:"))} Artemis requires Bun.`)
    console.log(`${c.bold(c.red("error:"))} Please install bun at https://bun.sh/`)
    process.exit(1)
}

console.log(`${c.gray("▪")} 💾 Copying example env file...`)
copyFile("example.env",".env")
await timeout(100)
console.write(ansi.cursorMove(0),ansi.cursorUp(),ansi.eraseEndLine)
let platform = ""
let friendlyPlatform = "N/A"
if (process.platform == "win32") {
    platform = "windows"
    friendlyPlatform = "Windows"
} else if (process.platform == "linux") {
    platform = "linux"
    friendlyPlatform = "Linux"
} else {
    platform = "unix"
    friendlyPlatform = "Other Unix-based OS"
}

console.log(`${c.gray("▪ 🖥️")}  Detected ${friendlyPlatform}`)
console.log(`${c.gray("|  ")}  You should use the ${(platform == "windows") ? "PowerShell script (start.ps1)" : "Bash script (start.sh)"} script to start Artemis.`)
await timeout(100)
let token = await secretPrompt(`${c.gray("▪ 🙈")} What is your Discord Bot's token? `);
console.write(ansi.cursorMove(0),ansi.cursorUp(),ansi.eraseEndLine)
console.log(`${c.gray("▪ 🙈")} What is your Discord Bot's token? ${c.gray("**********************")}`)
if (token.trim() == "") {
    console.log(`${c.gray("| ❌")} ${c.red("You did not enter a Discord Bot token.")}`); process.exit(1)
}

