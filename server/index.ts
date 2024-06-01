import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import staticPlugin from "@elysiajs/static";

import logger from "../components/logger";
import config from "./config";
import {
  endVerification,
  isVPN,
  secureIPHash,
  startVerification,
} from "../components/helper";
import { botClientId } from "../components/helper";
import { nocache } from "elysia-nocache";
import { compression } from "elysia-compression";
import { ip } from "elysia-ip";
import {
  dbopen,
  dbread,
  dbdroptable,
  dbmaketable,
  dbwrite,
} from "../components/sqllite";

(() => {
  let db = dbopen("db.sql");
  // clear table
  dbdroptable(db, "verification_tokens");
  setTimeout(() => {
    db.close(true);
  }, 100);
})();

const c = require("colors/safe");
const app: Elysia = new Elysia();

setTimeout(async () => {
  if (!(await Bun.file("db.sql").exists())) {
    logger.warn("Database file (db.sql) does not exist.");
    logger.info("Creating database file...");
    await Bun.write("db.sql", "");
  }
  if (!(await Bun.file("signals.db.json").exists())) {
    logger.warn("Database file (signals.db.json) does not exist.");
    logger.info("Creating database file...");
    await Bun.write("signals.db.json", `{"signals":{}}`);
  }
}, 33);

if (!Number(process.env.BOT_OWNER)) {
  logger.error("Specify the bot owner User ID in your .env file!");
  process.exit(1);
}
if (!process.env.BOT_TOKEN) {
  logger.error("Specify your bot's token in your .env file!");
  process.exit(1);
}
if (!process.env.DEPLOYMENT_URL) {
  logger.error("Specify your bot's deployment url in your .env file!");
  process.exit(1);
}

app.use(rateLimit(config.ratelimit));
app.use(staticPlugin({ assets: "server/static/", prefix: "/" }));
app.use(nocache);
app.use(compression());
app.use(ip());

app.get("detectincognito.min.js", async ({ set }) => {
  set.headers = {
    "Content-Type": "text/javascript",
  };
  return Bun.gunzipSync(
    await Bun.file("server/static/detectincognito.min.js.gz").arrayBuffer(),
  );
});


app.get("/api/", () => {
  return "Alive!";
});
// @ts-expect-error
app.get("/api/isvpn", ({ ip }) => {
  return isVPN(ip);
});
// @ts-expect-error
app.get("/api/ip", ({ ip }) => {
  return ip;
});
app.get("/api/isvpn/:ip", ({ params }) => {
  return isVPN(params.ip);
});

app.get("/invite", ({ set }) => {
  set.redirect = `https://discord.com/oauth2/authorize?client_id=${botClientId}&permissions=1374389716998&scope=bot+applications.commands`
  return "a";
});
app.get("/invite/", ({ set }) => {
  set.redirect = `https://discord.com/oauth2/authorize?client_id=${botClientId}&permissions=1374389716998&scope=bot+applications.commands`
  return "a";
});

app.post("/verify/:code/manualfail", async ({ params, body }) => {
  let signals = await Bun.file("signals.db.json").json();
  let db = dbopen("db.sql");
  if (dbread(db, "verification_tokens", params.code) == null) {
    return `Verification code does not exist.;`;
  }
  if (signals["signals"][String(params.code)]) {
    signals["signals"][String(params.code)] = `failed override;${body}`;
  }
  await Bun.write("signals.db.json", JSON.stringify(signals));
  return "success";
});

// @ts-expect-error
app.get("/api/verify/serverside/:code/", async ({ params, ip }) => {
  let signals = await Bun.file("signals.db.json").json();
  let db = dbopen("db.sql");
  if (dbread(db, "verification_tokens", params.code) == null) {
    return `failed;${params.code};Verification code does not exist.;`;
  }
  // @ts-expect-error
  let id = String(dbread(db, "verification_tokens", params.code).value);
  let vpn: boolean = await isVPN(ip);
  if (vpn) {
    if (signals["signals"][String(params.code)]) {
      signals["signals"][String(params.code)] = "failed vpn";
    }
    await Bun.write("signals.db.json", JSON.stringify(signals));
    return `failed;${params.code};Please turn off your VPN.;`;
  }
  let seed: bigint = BigInt(process.env.BOT_OWNER || 128);
  let iph = secureIPHash(ip, seed);
  let u = dbread(db, "users", id) || { value: "" };
  let l = dbread(db, "links", iph) || { value: "" };

  if (
    // @ts-expect-error
    (u.value || l.value) &&
    // @ts-expect-error
    ((u.value != iph && u.value != undefined) ||
      // @ts-expect-error
      (l.value != id && l.value != undefined))
  ) {
    if (signals["signals"][String(params.code)]) {
      signals["signals"][String(params.code)] = "failed alt";
    }
    await Bun.write("signals.db.json", JSON.stringify(signals));
    return `failed;${params.code};You already verified on a different account, if you think this is a mistake please ask your server admin to manually verify you.;`;
  } else {
    if (signals["signals"][String(params.code)]) {
      signals["signals"][String(params.code)] = "success";
    }
    await Bun.write("signals.db.json", JSON.stringify(signals));
    dbwrite(db, "users", id, secureIPHash(ip, seed));
    dbwrite(db, "links", secureIPHash(ip, seed), id);

    return `success;${params.code};`;
  }
});

//// only used for debugging purposes //////////
//
// app.get("/verify/start",( { })=>{
//    return startVerification(Math.random())
// })
//
///////////////////////////////////////////////

app.get("/verify/:code/exists", ({ params }) => {
  let db = dbopen("db.sql");
  if (dbread(db, "verification_tokens", params.code) != null) {
    return true;
  } else {
    return false;
  }
});
app.get("/verify/:code/", async () => {
  return Bun.file("server/static/verification.html");
});

app.listen(config.webserver.port, () => {
  logger.info(`Starting server on port ${c.bold(config.webserver.port)}`);
});
