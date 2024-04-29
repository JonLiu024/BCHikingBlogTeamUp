const difficulty = Object.freeze({
    EASY: "Easy",
    MODERATE: "Moderate",
    HARD: "Hard",

})

const { Blog } = require('./Blog');


const { default: mongoose } = require('mongoose');
const Schema = new mongoose.Schema;


const trailSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard", "Extremely Challenging"],
        required: true
    },

    photos: {
        type: [String],
        required: false

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

    rating: {
        type: Number,
        default: null,
    },
    description: {
        type: String,
        required: [true, "A description of this trail will be available soon"]
    }
    
}, 
{
    timestamps: true,
})


const Trail = mongoose.model("Trail", trailSchema);

module.exports = Trail