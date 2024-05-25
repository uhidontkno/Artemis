import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import staticPlugin from "@elysiajs/static";

import logger from "../components/logger"
import config from "./config"
import { isVPN, startVerification } from "../components/helper";

import { nocache } from 'elysia-nocache';
import { compression } from 'elysia-compression'
import { ip } from "elysia-ip";
import { dbopen, dbread,dbdroptable,dbmaketable } from "../components/sqllite";

(()=>{
    let db = dbopen("db.sql")
    // clear table
    dbdroptable(db,"verification_tokens")
    dbmaketable(db,"verification_tokens")
})();

const c = require("colors/safe")
const app:Elysia = new Elysia()

if (!(await (Bun.file("db.sql")).exists())) {
    logger.warn("Database file (db.sql) does not exist.")
    logger.info("Creating database file.")
    Bun.write("db.sql","")
}

app.use(rateLimit(config.ratelimit))
app.use(staticPlugin({"assets":"server/static/","prefix":"/"}))
app.use(nocache)
app.use(compression())
app.use(ip())

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