// const express = require("express");
// const requireAuth = require("../middleware/auth");
// const User = require("../models/User");
// const Emoji = require("../models/Emoji");
// const router = express.Router();

// // GET current user's favorites (expanded)
// router.get("/", requireAuth, async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id).populate("favorites");
//     res.json(user.favorites);
//   } catch (err) {
//     next(err);
//   }
// });

// // POST add favorite { emojiId }
// router.post("/", requireAuth, async (req, res, next) => {
//   try {
//     const { emojiId } = req.body;
//     const emoji = await Emoji.findById(emojiId);
//     if (!emoji) return res.status(404).json({ message: "Emoji not found" });

//     await User.findByIdAndUpdate(req.user.id, {
//       $addToSet: { favorites: emoji._id },
//     });
//     res.json({ message: "Added" });
//   } catch (err) {
//     next(err);
//   }
// });

// // DELETE remove favorite { emojiId }
// router.delete("/", requireAuth, async (req, res, next) => {
//   try {
//     const { emojiId } = req.body;
//     await User.findByIdAndUpdate(req.user.id, {
//       $pull: { favorites: emojiId },
//     });
//     res.json({ message: "Removed" });
//   } catch (err) {
//     next(err);
//   }
// });

// module.exports = router;

// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const requireAuth = require("../middleware/auth");

// /**
//  * Toggle favorite emoji for logged-in user
//  */
// router.post("/toggle", requireAuth, async (req, res) => {
//   try {
//     const { slug } = req.body;
//     if (!slug) return res.status(400).json({ message: "Missing emoji slug" });

//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.favorites.includes(slug)) {
//       user.favorites = user.favorites.filter((f) => f !== slug);
//     } else {
//       user.favorites.push(slug);
//     }

//     await user.save();
//     res.json({ favorites: user.favorites });
//   } catch (err) {
//     console.error("❌ Favorite toggle error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * Get all favorites for logged-in user
//  */
// router.get("/", requireAuth, async (req, res) => {
//   const user = await User.findById(req.user.id).select("favorites");
//   res.json({ favorites: user.favorites });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const requireAuth = require("../middleware/auth"); // ❌ Temporarily disable for testing

/**
 * Toggle favorite emoji for logged-in user
 */
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

router.get("/", async (req, res) => {
  const user = await User.findOne(); // use first user for demo
  if (!user) return res.json({ favorites: [] });
  res.json({ favorites: user.favorites });
});

module.exports = router;
