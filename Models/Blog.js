const mongoose = require('mongoose');
const { user } = require('./Trail');

const blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    user: {
        type: user,
        required: true
    },
    images: {
        type: [String],
        required: false
    },
    trail: {
        type: trail,
        required: true
    },
    content: {
        type: String,
        require: [true, "The blog content will be updated soon!"]
    },

})