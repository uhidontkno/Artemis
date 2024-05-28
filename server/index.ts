import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import staticPlugin from "@elysiajs/static";

import logger from "../components/logger"
import config from "./config"
import { endVerification, isVPN, secureIPHash, startVerification } from "../components/helper";

import { nocache } from 'elysia-nocache';
import { compression } from 'elysia-compression'
import { ip } from "elysia-ip";
import { dbopen, dbread,dbdroptable,dbmaketable,dbwrite } from "../components/sqllite";

(()=>{
    let db = dbopen("db.sql")
    // clear table
    dbdroptable(db,"verification_tokens")
    setTimeout(()=>{db.close(true)},100)
})();

const c = require("colors/safe")
const app:Elysia = new Elysia()


setTimeout(async ()=>{
    if (!(await (Bun.file("db.sql")).exists())) {
        logger.warn("Database file (db.sql) does not exist.")
        logger.info("Creating database file...")
        Bun.write("db.sql","")
    }
    if (!(await (Bun.file("signals.db.json")).exists())) {
        logger.warn("Database file (signals.db.json) does not exist.")
        logger.info("Creating database file...")
        Bun.write("signals.db.json","{}")
    }
},33)


if (!Number(process.env.BOT_OWNER)) {
    logger.error("Specify the bot owner User ID in your .env file!");process.exit(1);
}
if (!process.env.BOT_TOKEN) {
    logger.error("Specify your bot's token in your .env file!");process.exit(1);
}

app.use(rateLimit(config.ratelimit))
app.use(staticPlugin({"assets":"server/static/","prefix":"/"}))
app.use(nocache)
app.use(compression())
app.use(ip())

app.get("detectincognito.min.js",async ({ set })=>{
    set.headers = {
        "Content-Type": "text/javascript"
    }
    return Bun.gunzipSync(await Bun.file("server/static/detectincognito.min.js.gz").arrayBuffer());
})

app.get("/api/",()=>{return "Alive!"})

app.get("/api/isvpn",( { ip } )=>{
    return isVPN(ip)
})
app.get("/api/ip",( { ip } )=>{
    return ip
})
app.get("/api/isvpn/:ip",( { params } )=>{
    return isVPN(params.ip)
})

app.get("/api/verify/serverside/:code/",async ( { params,ip } )=>{
    let db = dbopen("db.sql")
    if (dbread(db,"verification_tokens",params.code) == null) {
    return `failed;${params.code};Verification code does not exist.;`;
    }
    let vpn:boolean = await isVPN(ip)
    if (vpn) {
        endVerification(params.code)
        return `failed;${params.code};Please turn off your VPN.;`;
    }
    let seed:bigint = BigInt(process.env.BOT_OWNER || 128);
    // @ts-expect-error
    let id = String(dbread(db,"verification_tokens",params.code).value);
    let iph = secureIPHash(ip,seed);
    if (dbread(db,"links",iph) != null || dbread(db,"users",id) != iph) {
        endVerification(params.code)
        return `failed;${params.code};You already verified on a different account, if you think this is a mistake please ask your server admin to manually verify you.;`;
        } else {
            
            dbwrite(db,"links",id,secureIPHash(ip,seed));
            endVerification(params.code)
        }
})

// will be replaced by discord bot soon
app.get("/verify/start",( { })=>{
    return startVerification(1233456654323456)
})
app.get("/verify/:code/exists",( { params })=>{
    let db = dbopen("db.sql")
    if (dbread(db,"verification_tokens",params.code) != null) {
        return true
    } else {return false}
    
})
app.get("/verify/:code/",async ()=>{
    return (Bun.file("server/static/verification.html"))
})

app.listen(config.webserver.port,()=>{
    logger.info(`Starting server on port ${c.bold(config.webserver.port)}`)
})