// backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: {
    type: String,
    enum: ["Admin", "Staff"],
    default: "Staff",
  },
});

module.exports = mongoose.model("User", UserSchema);
