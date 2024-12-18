const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Trail = require("../models/Trail.js");
const User = require("../models/Users.js");
const Blog = require("../models/Blog.js");
const { ObjectId } = require("mongodb");
const blogRoute = require("../routers/router.blog.js");
const trailRoute = require("../routers/router.trail.js");
const userRoute = require("../routers/router.user.js");

require("dotenv").config({ path: __dirname + "/.env" });

console.log(process.env);
const PORT = process.env.PORT || 5000;
const db_connection = process.env.DB_CONNECTION_STR;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//route
app.use("/api/trails/", trailRoute);
app.use("/api/blogs/", blogRoute);
app.use("/api/users/", userRoute);

app.get("/", (req, res) => {
  res.send("Hellow from the Node API server");
});

/**
 * establishes connections to the mongodb database
 */
mongoose
  .connect(db_connection)
  .then(() => {
    console.log("database connection launched");
    app.listen(PORT, (req, res) => {
      console.log("server is running at port 3001");
    });
  })
  .catch(() => {
    console.log("database connection fails");
  });
