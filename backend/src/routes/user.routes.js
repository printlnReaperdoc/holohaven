import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Register push token
router.post("/push-token", authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;

    await User.updateOne(
      { _id: req.userId, "pushTokens.token": { $ne: token } },
      {
        $push: {
          pushTokens: { token, lastUsedAt: new Date() },
        },
      }
    );

    await User.updateOne(
      { _id: req.userId, "pushTokens.token": token },
      {
        $set: { "pushTokens.$.lastUsedAt": new Date() },
      }
    );

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-passwordHash")
      .populate("reviewsPosted");
    if (!user) return res.sendStatus(404);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { fullName, phone, bio, address, username, email, password, currentPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // If updating password, verify current password
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to change password" });
      }
      const ok = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!ok) return res.status(401).json({ error: "Current password is incorrect" });
      
      // Validate new password
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    // If updating email, check uniqueness
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      user.email = email;
    }

    // If updating username, check uniqueness
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }
      user.username = username;
    }

    // Update other profile fields
    if (fullName !== undefined) user.fullName = fullName || undefined;
    if (phone !== undefined) user.phone = phone || undefined;
    if (bio !== undefined) user.bio = bio || undefined;
    if (address !== undefined) user.address = address || undefined;

    await user.save();
    
    const updatedUser = await User.findById(req.userId).select("-passwordHash");
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPLOAD profile picture
router.post(
  "/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const user = await User.findByIdAndUpdate(
        req.userId,
        { profilePicture: req.file.path },
        { new: true }
      ).select("-passwordHash");

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET user reviews
router.get("/reviews", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "reviewsPosted",
      populate: [
        { path: "productId", select: "name image" },
        { path: "orderId", select: "createdAt" },
      ],
    });

    if (!user) return res.sendStatus(404);
    res.json(user.reviewsPosted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
