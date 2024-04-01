const difficulty = Object.freeze({
    EASY: "Easy",
    MODERATE: "Moderate",
    HARD: "Hard",

})



const { default: mongoose } = require('mongoose');
const mongoose = require(mongoose);

const trailSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true,
    },
    difficulty: {
        type: difficulty,
        required: true
    },

    photos: {
        type: [String],
        required: true

    },
    elevation: {
        type: String,
        required: true
    },
    length: {
        type: String,
        required: true
    },
    routeType: {
        type: String,
        required: true
    },
    blogs: {
        type: [blog],
    },
    reviews: {
        type: [review],

    },
    rating: {
        type: Number,
        required: [true, "None"]
    },
    description: {
        type: String,
        required: [true, "A description of this trail will be available soon"]
    }
    
}, 
{
    timestamps: true,
})


export const user = mongoose.model("trail", trailSchema);