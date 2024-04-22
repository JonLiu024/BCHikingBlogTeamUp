const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Trail = require('./Models/Trail.js');
const User = require("./Models/Users.js");
const Blog = require("./Models/Blog.js");
const { ObjectId } = require("mongodb");
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const db_connection = process.env.DB_CONNECTION_STR;

app.use(express.json());
app.use(express.urlencoded({extended: false}));

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
        if (error.code == 11000) {
            res.status(409).send({message: "The trail with the same name has been created! Please add something new."});
        }
        res.status(500).send({message: error.message})
    }
})


/**
 * saves a user profile to the database 
 *
 */
app.post("/api/user", async (req, res) => {
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
app.post("/api/blog", async (req, res) => {
    try {
        const { user, trail } = req.params;

        req.body.trail = new ObjectId(trail);
        req.body.user = new ObjectId(user);
        
        const blog = await Blog.create(req.body);

        res.status(200).json(blog);

    } catch (err) {
        if (err.code == 11000) {
            res.status(409).send({message: "A blog with the same title has been created by the same user for the same trail!"});
        }
        res.status(500).send({message: err.message})

    }
})



/**
 * Updates a users based on the request
 */
app.put('/api/users/:id', async(req, res) => {
    try {
        const {id} = req.params;
        //findByIdAndUpdate method finds the object by its id and update it
        //base on the given request body
        const user = await User.findByIdAndUpdate(id, req.body);
        
        if (!user) {
            res.status(404).json({message: "the user is not found!"});
        }

        const updatedUser = await User.findById(id);
        res.status(200).json(updatedUser);     

    } catch (error) {
        res.status(500).json({message: error.message})
    }
})



/**
 * Updates a blog object based on the request
 *
 */
app.put('/api/blog/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const blog = await Blog.findByIdAndUpdate(id, req.body);

        if (!blog) {
            res.status(404).json({message: "The blog is not found!"});
        }

        const updatedBlog = await Blog.findById(id);
        res.status(200).json(updatedBlog);

    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

/**
 * Updates a trail profile based on the request
 */
app.put('/api/trail/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const trail = await Trail.findByIdAndUpdate(id, req.body);
        if (!trail) {
            res.status(404).json({message: "The trail is not found!"});
        }

        const updatedTrail = await Trail.findById(id);
        res.status(200).json(updatedTrail);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

/**
 * deletes a user from the database
 */
app.delete('/api/user/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            res.status(404).json({message: "The user cannot be found"});
        }
        res.status(200).json({message: "user successfully deleted"});
    } catch (error) {
        res.status(500).send({message: error.message});
    }
})


/**
 * deletes a blog from the database
 */
app.delete('/api/blog/:id', async(req,res)=> {
    try {
        const {id} = req.params;
        const blog = Blog.findByIdAndDelete(id);
        
        if (!blog) {
            res.status(404).json({message: "the blog cannot be found."});
        }
        res.status(200).json({message: "blog successfully deleted"});
    } catch (error) {
        res.status(500).send({message: error.message});
    }
})


/**
 * deletes a trail profile from the database
 *
 */

app.delete('/api/trail/:id', async(req,res)=> {
    try {
        const {id} = req.params;
        const trail = Trail.findByIdAndDelete(id);
        
        if (!trail) {
            res.status(404).json({message: "the blog cannot be found."});
        }
        res.status(200).json({message: "blog successfully deleted"});
    } catch (error) {
        res.status(500).send({message: error.message});
    }
})





/**
 * establishes connections to the mongodb database 
 */
mongoose.connect("mongodb+srv://tliu024:nNX93sORnk220jQe@backenddb.o5pkwek.mongodb.net/?retryWrites=true&w=majority&appName=BackendDB")
.then(()=> {
    console.log("database connection launched");
    app.listen(3001, (req, res)=> {
        console.log("server is running at port 3001");
    })

}).catch(() => {
    console.log("database connection fails");
})

