const mongoose = require('mongoose')
const { User } = require('./Users');
const { Trail } = require('./Trail');
const Schema = new mongoose.Schema;
const blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    images: {
        type: [String],
        required: false
    },
    trail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trail",
        required: true
    },
    content: {
        type: String,
        require: [true, "The blog content will be updated soon!"]
    },

})
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog