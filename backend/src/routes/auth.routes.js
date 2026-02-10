import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      passwordHash: hash,
    });

    res.json({ 
      token: signToken(user._id), 
      userId: user._id,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ 
      token: signToken(user._id), 
      userId: user._id,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Google Login
router.post("/google", async (req, res) => {
  try {
    const { googleId, email, fullName, profilePicture } = req.body;

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (!user) {
      // Create new user from Google login
      user = await User.create({
        googleId,
        email,
        googleEmail: email,
        fullName,
        profilePicture,
        username: email.split("@")[0] + Math.random().toString(36).substr(2, 9),
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.googleEmail = email;
      if (!user.profilePicture) user.profilePicture = profilePicture;
      await user.save();
    }

    res.json({ 
      token: signToken(user._id), 
      userId: user._id,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
