const mongoose = require('mongoose')
const { Blog } = require('./Blog');

const Schema = new mongoose.Schema;

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    
    image: {
        type: String,
        required: false
    }
    

}, 
{
    timestamps: true,
})

//implement the delete no action pre-hook middleware 

userSchema.pre('remove', async function (next) {
    try {
        const user = this;
        const blogCount = await Blog.countDocuments({user: user._id});
        if (blogCount > 0) {
            throw new Error("This user cannot be removed as it is associated with existing blogs");
        }
        next();
    } catch (error) {
        
        next(error);
    }
})



// //implement delete on cascade mechanisms
// userSchema.pre('remove', async function(id) {
//     try {
//         const user = this;
//         await Blog.deleteMany({user: user._id});
//         next();
//     } catch (error) {
//         next(error);
//     }
// })

const User = mongoose.model("User", userSchema);

module.exports = User