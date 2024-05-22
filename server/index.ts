import Elysia from "elysia";
const app:Elysia = new Elysia()

app.get("/",()=>{return "k"})

app.listen(1667,()=>{
    console.log("Starting server on port 1667")
})