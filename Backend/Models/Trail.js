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
        required: true
    },
    location: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Moderate", "Hard"],
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
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog' // This must match the name you gave your model when you did mongoose.model('Blog', blogSchema)
      }],
   
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