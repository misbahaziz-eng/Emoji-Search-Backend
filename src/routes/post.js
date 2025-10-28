const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const Post = require("../models/post");

// 🟢 Get all posts
router.get("/", requireAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟢 Create a post
router.post("/", requireAuth, async (req, res) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      createdBy: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🟡 Update post (only creator)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.content = req.body.content;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔴 Delete post (only creator)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 💬 React to a post

router.post("/:id/react", requireAuth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasReacted = post.reactions.some(
      (r) => r.emoji === emoji && r.users.some((u) => u.toString() === userId)
    );

    let updatedPost;

    if (hasReacted) {
      // 👎 User already reacted → remove
      updatedPost = await Post.findOneAndUpdate(
        { _id: req.params.id, "reactions.emoji": emoji },
        { $pull: { "reactions.$.users": userId } },
        { new: true }
      );
      // remove the reaction if no users left
      updatedPost.reactions = updatedPost.reactions.filter(
        (r) => r.users.length > 0
      );
      await updatedPost.save();
    } else {
      // 👍 Add user to emoji reaction (or create new one)
      const existing = post.reactions.find((r) => r.emoji === emoji);
      if (existing) {
        updatedPost = await Post.findOneAndUpdate(
          { _id: req.params.id, "reactions.emoji": emoji },
          { $addToSet: { "reactions.$.users": userId } },
          { new: true }
        );
      } else {
        updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          { $push: { reactions: { emoji, users: [userId] } } },
          { new: true }
        );
      }
    }

    // ✅ populate final, consistent result
    const populated = await Post.findById(updatedPost._id)
      .populate("createdBy", "username email")
      .populate("reactions.users", "username email");
    res.json(populated);
  } catch (err) {
    console.error("Error reacting:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
