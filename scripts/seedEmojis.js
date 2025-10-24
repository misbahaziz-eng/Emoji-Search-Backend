// scripts/seedEmojis.js
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");

// Adjust require path if your model is in a different location
const Emoji = require(path.join(__dirname, "..", "src", "models", "Emoji"));

const emojis = [
  {
    slug: "grinning",
    emoji: "😀",
    name: "Grinning Face",
    keywords: ["face", "grin", "smile"],
  },
  {
    slug: "joy",
    emoji: "😂",
    name: "Face with Tears of Joy",
    keywords: ["face", "tears", "joy", "laugh"],
  },
  {
    slug: "thumbs_up",
    emoji: "👍",
    name: "Thumbs Up",
    keywords: ["hand", "thumb", "like", "approve"],
  },
  {
    slug: "red_heart",
    emoji: "❤️",
    name: "Red Heart",
    keywords: ["heart", "love"],
  },
  {
    slug: "fire",
    emoji: "🔥",
    name: "Fire",
    keywords: ["flame", "hot", "lit"],
  },
  {
    slug: "party_popper",
    emoji: "🎉",
    name: "Party Popper",
    keywords: ["party", "celebrate", "congrats"],
  },
];

(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI missing in .env");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 Connected to MongoDB for seeding");

    // OPTIONAL: clear existing (uncomment if you want to replace)
    // await Emoji.deleteMany({});
    // console.log("🗑 Cleared existing emojis collection");

    // We'll insert only those that aren't already present (prevents duplicate-key errors)
    const existing = await Emoji.find({
      slug: { $in: emojis.map((e) => e.slug) },
    }).lean();
    const existingSlugs = new Set(existing.map((e) => e.slug));
    const toInsert = emojis.filter((e) => !existingSlugs.has(e.slug));

    if (toInsert.length === 0) {
      console.log("✅ All emojis already present. Nothing to insert.");
    } else {
      const inserted = await Emoji.insertMany(toInsert, { ordered: false });
      console.log(`🌱 Inserted ${inserted.length} emoji(s)`);
    }

    // done
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
})();
