// backend/routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Simple registration
router.post("/register", async (req, res) => {
  try {
    const newUser = new User(req.body);
    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Simple login (example, no JWT yet)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    res.json({ message: "Login successful", user });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

module.exports = router;
