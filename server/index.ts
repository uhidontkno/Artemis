import Elysia from "elysia";
import logger from "../components/logger"
const app:Elysia = new Elysia()

app.get("/",()=>{return "k"})

app.listen(1667,()=>{
    logger.info("Starting server on port 1667")
})