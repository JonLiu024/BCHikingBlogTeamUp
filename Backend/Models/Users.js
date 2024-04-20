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
    blogs: {
        type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog' 
      }],
      required: false
    },
    image: {
        type: String,
        required: false
    }
    

}, 
{
    timestamps: true,
})


const User = mongoose.model("User", userSchema);

module.exports = User