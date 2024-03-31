
const { default: mongoose } = require('mongoose');
const mongoose = require(mongoose);

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
        type: Blog[any],
        require: false
    },
    image: {
        type: String,
        required: true
    }
    

}, 
{
    timestamps: true,
})


export const user = mongoose.model("user", userSchema);