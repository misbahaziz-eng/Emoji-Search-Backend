const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies);
    const token = req.cookies?.token;
    console.log("Token =====>", token);
    console.log("🧩 Cookie token received:", req.cookies?.token);

    if (!token) return res.status(401).json({ message: "Unauthorized" });
    console.log("🧩 Verifying token with JWT_SECRET:", process.env.JWT_SECRET);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach minimal user info
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = requireAuth;
