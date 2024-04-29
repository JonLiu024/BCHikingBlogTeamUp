
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).snde({message : error.message});
    }
};


const getBlogById = async (req, res) => {
    try {
        const {blogid} = req.params;
        const blog = await Blog.findById(blogid);
        if (!blog) {
            return res.status(404).send({message: "the blog cannot be found!"});
        }

        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).send({message : error.message});
    }
}

const getBlogsByTrail = async (req, res) => {
    try {
        const {trailId} = req.params;
        const blogs = await Blog.find({trail: trailId}).populate("trail");
        if (blogs.length == 0) {
            return res.status(404).send({message: "No blog posts of this trail is found"});
        
        }
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).send({message: error.message});
        
    }
}

const getBlogsByUser = async(req, res) => {
    try {
        const {userId} = req.params;
        const blogs = await Blog.find({user: userId}).populate('user');
        if (blogs.length == 0) {
            return res.status(404).send({message: "The user has not posted anything yet"});
        }
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).send({message: error.message});
    }
}


/**
 * creates a blog post that associates to an existing trail profile
 * @param {*} req - must conatains an existing and valid trail id parameter, and an existing user 
 * @param {*} res 
 */
const createBlog = async (req, res) => {
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
}

const updateBlog = async(req, res) => {
    try {
        const {id} = req.params;
        const blog = await Blog.findByIdAndUpdate(id, req.body);

        if (!blog) {
            return res.status(404).json({message: "The blog is not found!"});
        }

        const updatedBlog = await Blog.findById(id);
        res.status(200).json(updatedBlog);

    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

const deleteBlog = async(req,res)=> {
    try {
        const {id} = req.params;
        const blog = Blog.findByIdAndDelete(id);
        
        if (!blog) {
            return res.status(404).json({message: "the blog cannot be found."});
        }
        res.status(200).json({message: "blog successfully deleted"});
    } catch (error) {
        res.status(500).send({message: error.message});
    }
}


module.exports = {createBlog, updateBlog, deleteBlog, getAllBlogs, getBlogById, getBlogsByTrail, getBlogsByUser}