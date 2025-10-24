const express = require("express");
const Emoji = require("../models/Emoji");
const router = express.Router();

// 🧠 GET all emojis
router.get("/", async (req, res) => {
  try {
    const emojis = await Emoji.find();
    res.json(emojis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🧩 POST seed emojis (for setup only)
router.post("/seed", async (req, res) => {
  try {
    const data = req.body; // array of emojis
    await Emoji.deleteMany({});
    await Emoji.insertMany(data);
    res.json({ message: "✅ Emojis seeded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
