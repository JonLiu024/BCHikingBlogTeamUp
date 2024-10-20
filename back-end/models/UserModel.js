const mongoose = require("mongoose");
const { Blog } = require("./BlogModel");

const Schema = new mongoose.Schema();

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    pic: {
      type: String,
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  {
    timestamps: true,
  }
);

//implement the delete no action pre-hook middleware

userSchema.pre("remove", async function (next) {
  try {
    const user = this;
    const blogCount = await Blog.countDocuments({ user: user._id });
    if (blogCount > 0) {
      throw new Error(
        "This user cannot be removed as it is associated with existing blogs"
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

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

module.exports = User;
