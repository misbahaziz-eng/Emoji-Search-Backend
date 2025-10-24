// src/utils/seedEmojis.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import Emoji from "../models/Emoji.js"; // adjust if path differs
import emojis from "../../data/emojis.json" assert { type: "json" }; // if you have emoji data

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/emojiDB";

async function seedEmojis() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear old data
    await Emoji.deleteMany({});
    console.log("🧹 Old data cleared");

    // Insert new data
    await Emoji.insertMany(emojis);
    console.log("🌱 Seeded emojis successfully");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  }
}

seedEmojis();
