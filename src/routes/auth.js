const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();
const COOKIE_NAME = process.env.COOKIE_NAME || "token";

/**
 * 🧩 REGISTER
 */
router.post(
  "/register",
  [
    body("username").isLength({ min: 3 }).withMessage("Username too short"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password too short"),
  ],
  async (req, res, next) => {
    try {
      console.log("📩 Register request body:", req.body);

      // Validate inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Check if user exists
      const existing = await User.findOne({ $or: [{ email }, { username }] });
      if (existing) {
        console.log("⚠️ User already exists:", existing.email);
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        favorites: [],
      });

      console.log("✅ Saved user:", user);

      res.status(201).json({
        id: user._id,
        username: user.username,
        email: user.email,
      });
    } catch (err) {
      console.error("❌ Registration error:", err);
      next(err);
    }
  }
);

/**
 * 🔑 LOGIN
 */
// router.post(
//   "/login",
//   [body("email").isEmail(), body("password").exists()],
//   async (req, res, next) => {
//     try {
//       const { email, password } = req.body;
//       const user = await User.findOne({ email });
//       if (!user)
//         return res.status(401).json({ message: "Invalid credentials" });

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch)
//         return res.status(401).json({ message: "Invalid credentials" });

//       const token = jwt.sign(
//         { sub: user._id.toString(), username: user.username },
//         process.env.JWT_SECRET,
//         { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
//       );
//       console.log("🔐 Signing token with JWT_SECRET:", process.env.JWT_SECRET);

//       const isProd = process.env.NODE_ENV === "production";
//       res.cookie(COOKIE_NAME, token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production" ? true : false,
//         sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//         path: "/",
//         maxAge: 24 * 60 * 60 * 1000,
//       });

//       console.log("✅ Cookie set successfully for:", user.email);
//       res.json({ message: "Logged in", username: user.username });
//     } catch (err) {
//       console.error("❌ Login error:", err);
//       next(err);
//     }
//   }
// );

router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res, next) => {
    try {
      console.log("📥 Login request body:", req.body);

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        console.log("❌ No user found for email:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("❌ Password mismatch for:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // ✅ Log environment and JWT_SECRET
      console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET);

      const token = jwt.sign(
        { sub: user._id.toString(), username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
      );

      console.log("✅ Token generated successfully.");

      const isProd = process.env.NODE_ENV === "production";
      res.cookie(process.env.COOKIE_NAME || "token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });

      console.log("✅ Cookie set successfully for:", user.email);

      res.json({
        message: "Logged in successfully",
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          favorites: user.favorites,
        },
      });
    } catch (err) {
      console.error("🔥 Login route failed:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * 🚪 LOGOUT
 */
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  console.log("👋 Logged out user");
  res.json({ message: "Logged out" });
});

/**
 * 👤 GET CURRENT USER
 */
const requireAuth = require("../middleware/auth");

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "username email favorites"
  );
  res.json({
    id: user._id,
    username: user.username,
    email: user.email,
    favorites: user.favorites,
  });
});

router.get("/all", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;
