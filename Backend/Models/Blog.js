const mongoose = require('mongoose')
const { User } = require('./Users');
const { Trail } = require('./Trail');
const { Timestamp } = require('mongodb');
const Schema = new mongoose.Schema;
const blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        validate: {
            validator: async function(userId) {
                const user = await mongoose.model('User').findById(userId);
                return !!user;
            },
            message: props => `${props.value} is not a valid user Id`
        }
    },
    images: {
        type: [String],
        required: false
    },
    trail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trail",
        required: [true, "please add the trail this blog is associated to!"],
        validate : {
            validator: async function(trailId) {
                const trail = await mongoose.model('Trail').findById(trailId);
                return !!trail;
            },
            message: props => `${props.value} is not a valid trail Id`
        }
    },
    content: {
        type: String,
        require: [true, "The blog content will be updated soon!"]
    },
    

}, {
    timestamps: true
})
//reinforce the unique constraints for the blog with title, user and trail composite

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog