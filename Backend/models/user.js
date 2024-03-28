const mongoose = require("mongoose");

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: String,
  mobile: String,
  profileImage: String,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  role: {
    type: String,
    default: "visitor",
  },
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
