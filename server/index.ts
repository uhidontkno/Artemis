import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";
import staticPlugin from "@elysiajs/static";
import logger from "../components/logger"
import config from "./config"
const c = require("colors/safe")
const app:Elysia = new Elysia()
app.use(rateLimit(config.ratelimit))
app.use(staticPlugin({"assets":"server/static/","prefix":"/"}))

app.get("/api/",()=>{return "Alive!"})

app.listen(config.webserver.port,()=>{
    logger.info(`Starting server on port ${c.bold(config.webserver.port)}`)
})