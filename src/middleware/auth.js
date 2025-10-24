const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * requireAuth middleware
 * - accepts a cookie named `token` OR an Authorization: Bearer <token> header
 * - useful for dev flexibility: frontend can send token as Bearer if cookies are difficult
 */
const requireAuth = async (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies);
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    // prefer cookie, fallback to Bearer header
    const token = req.cookies?.token || bearerToken;
    console.log("Token =====>", token);

    if (!token) return res.status(401).json({ message: "Unauthorized" });
    console.log("🧩 Verifying token with JWT_SECRET:", process.env.JWT_SECRET);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach minimal user info
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (err) {
    console.error("Auth error:", err.message || err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = requireAuth;
