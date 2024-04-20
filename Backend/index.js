const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Trail = require('./Models/Trail.js');
const User = require("./Models/Users.js");
const Blog = require("./Models/Blog.js");
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const db_connection = process.env.DB_CONNECTION_STR;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hellow from the Node API server");
})


/**
 * retrieves all the trails from the database
 */
app.get("/api/trails", async (req, res)=> {
    try {
        const users = await Trail.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send({message: error.Message});
    }
    
})

/**
 * retrieves all the blogs from database
 */

app.get("/api/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).snde({message : error.message});
    }
})


/**
 * retrieves all the blogs that belongs to a user
 */


/**
 * retrieves all the user profiles from the database
 */
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send({message : error.message})
        
    }
} )

/**
 * saves a trail profile to the database
 */
app.post('/api/trail', async(req, res) => {
    try {
        const trail = await Trail.create(req.body);
        res.status(200).json(trail);
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})


/**
 * saves a user profile to the database 
 */
app.post("/api/users", async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(200).json(user);

    } catch (err) {
        res.status(500).send({Message: err.Message})

    }
})

/**
 * saves a blog profile to the database 
 */
app.post("/api/users", async (req, res) => {
    try {
        const blog = await Blog.create(req.body);
        res.status(200).json(blog);

    } catch (err) {
        res.status(500).send({Message: err.Message})

    }
})


/**
 * establishes connections to the mongodb database 
 */
mongoose.connect("mongodb+srv://tliu024:nNX93sORnk220jQe@backenddb.o5pkwek.mongodb.net/?retryWrites=true&w=majority&appName=BackendDB")
.then(()=> {
    console.log("database connection launched");
    app.listen(3000, (req, res)=> {
        console.log("listening to port 3000");
    })

}).catch(() => {
    console.log("database connection fails");
})

