const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: {
    type: [String], // storing emoji slugs instead of ObjectIds
    default: [], // 👈 this prevents undefined
  },
});

module.exports = mongoose.model("User", userSchema);
