import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import staticPlugin from "@elysiajs/static";

import logger from "../components/logger"
import config from "./config"
import { isVPN } from "../components/helper";

import { nocache } from 'elysia-nocache';
import { compression } from 'elysia-compression'
import { ip } from "elysia-ip";

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
app.get("/api/isvpn/:ip",( { params } )=>{
    return isVPN(params.ip)
})

app.listen(config.webserver.port,()=>{
    logger.info(`Starting server on port ${c.bold(config.webserver.port)}`)
})