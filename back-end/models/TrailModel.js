const { Blog } = require("./BlogModel");

const difficulty = Object.freeze({
  EASY: "Easy",
  MODERATE: "Medium",
  HARD: "Hard",
  CHALLENGING: "Extremely challenging",
});

const { default: mongoose } = require("mongoose");
const Schema = new mongoose.Schema();

const trailSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Extremely challenging"],
      required: true,
    },

    photos: {
      type: [String],
      required: false,
    },
    elevation: {
      type: String,
      required: true,
    },
    length: {
      type: String,
      required: true,
    },
    routeType: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      required: [true, "A description of this trail will be available soon"],
    },
  },
  {
    timestamps: true,
  }
);
//implement delete no action mechanism using prehook
trailSchema.pre("remove", async function (next) {
  try {
    const trail = this;
    const countBlog = Blog.countDocuments({ trail: trail._id });
    if (countBlog > 0) {
      throw new Error(
        "This trail cannot be deleted as it is associated with many blogs"
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Trail = mongoose.model("Trail", trailSchema);

module.exports = Trail;
