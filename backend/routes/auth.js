const express = require("express");
const { register, login } = require("../controllers/authController");
const { auth, isAdmin } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Get current user info
router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

// Get all users (Admin only)
router.get("/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("name email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
