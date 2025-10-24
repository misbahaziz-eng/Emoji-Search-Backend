const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Apply CORS middleware once (Express 5 handles preflight automatically)
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

// ✅ Debug log to verify server starts correctly
console.log("✅ Loaded JWT_SECRET:", process.env.JWT_SECRET);

// ✅ Connect MongoDB
(async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    console.log("📂 Database Name:", conn.connection.name);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
})();

// ✅ ROUTES
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/emoji", require("./src/routes/emoji"));
app.use("/api/favorites", require("./src/routes/favorites"));

// ✅ Default route
app.get("/", (req, res) => {
  res.send("🚀 Backend is working ✅");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🟢 Server running on port ${PORT}`));
