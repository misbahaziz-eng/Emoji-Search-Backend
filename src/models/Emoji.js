// src/models/Emoji.js
const mongoose = require("mongoose");

const emojiSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  emoji: { type: String, required: true },
  name: { type: String, required: true },
  keywords: [{ type: String }],
});

module.exports = mongoose.model("Emoji", emojiSchema);
