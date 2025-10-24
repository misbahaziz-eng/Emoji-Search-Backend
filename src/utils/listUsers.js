require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find().lean();
    console.log("\n📋 Users in database:\n", users);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
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
