const express = require("express");
const router = express.Router();
const User = require("../models/User");
const requireAuth = require("../middleware/auth"); // ❌ Temporarily disable for testing

// Toggle favorite emoji
router.post("/toggle", requireAuth, async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ message: "Missing emoji slug" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.favorites = user.favorites || [];

    if (user.favorites.includes(slug)) {
      user.favorites = user.favorites.filter((f) => f !== slug);
    } else {
      user.favorites.push(slug);
    }

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("❌ Favorite toggle failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.json({ favorites: [] });
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("❌ Get favorites failed:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
