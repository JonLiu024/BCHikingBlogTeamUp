const express = require("express");
const app = express();

app.listen(3000, (req, res)=> {
    console.log("listening ");
})

app.get("/", (req, res)=> {
    res.status(200).send("Hello world, end point installed successfully");
})