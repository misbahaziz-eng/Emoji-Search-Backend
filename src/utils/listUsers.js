require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to:", mongoose.connection.name);

    const users = await User.find();
    console.log("📦 Found users:", users.length);
    console.log(
      users.map((u) => ({ id: u._id, username: u.username, email: u.email }))
    );

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error listing users:", err);
  }
}

listUsers();
