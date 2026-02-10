import express from "express";
import { Expo } from "expo-server-sdk";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
const expo = new Expo();

/**
 * Send notification to a user device
 */
export const sendNotification = async (pushToken, notification) => {
  try {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.log(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    const messages = [
      {
        to: pushToken,
        sound: "default",
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      },
    ];

    const tickets = await expo.sendPushNotificationsAsync(messages);
    console.log("Notification sent successfully:", tickets);
    return tickets;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

/**
 * Send promotion notification to all users
 * POST /notifications/send-promotion
 * Admin only
 */
router.post("/send-promotion", authMiddleware, async (req, res) => {
  try {
    const { productId, title, message } = req.body;

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get all users with push tokens
    const users = await User.find({ "pushTokens.0": { $exists: true } });

    if (users.length === 0) {
      return res.json({ message: "No users with push tokens" });
    }

    const notification = {
      title: title || `Special: ${product.name}`,
      body: message || `Check out ${product.name} - $${product.price}`,
      data: {
        productId: product._id.toString(),
        productName: product.name,
        price: product.price.toString(),
        image: product.image,
        category: product.category,
      },
    };

    // Send notification to each user
    let sentCount = 0;
    for (const user of users) {
      for (const tokenObj of user.pushTokens) {
        await sendNotification(tokenObj.token, notification);
        sentCount++;
      }
    }

    res.json({
      message: `Sent ${sentCount} promotions`,
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send specific product promotion
 * For the shiranui flare hoodie example
 * POST /notifications/send-shiranui-promo
 */
router.post("/send-shiranui-promo", authMiddleware, async (req, res) => {
  try {
    // Find shiranui flare hoodie product
    const product = await Product.findOne({
      name: { $regex: "shiranui flare hoodie", $options: "i" },
    });

    if (!product) {
      return res.status(404).json({ error: "Shiranui Flare Hoodie not found" });
    }

    // Get all users with push tokens
    const users = await User.find({ "pushTokens.0": { $exists: true } });

    if (users.length === 0) {
      return res.json({ message: "No users with push tokens" });
    }

    const notification = {
      title: "🔥 Limited Time: Shiranui Flare Hoodie",
      body: "Now only $35.00 - Don't miss out!",
      data: {
        productId: product._id.toString(),
        productName: product.name,
        price: "35.00",
        image: product.image,
        category: product.category,
        promotion: true,
      },
    };

    // Send notification to each user
    let sentCount = 0;
    for (const user of users) {
      for (const tokenObj of user.pushTokens) {
        await sendNotification(tokenObj.token, notification);
        sentCount++;
      }
    }

    res.json({
      message: `Sent ${sentCount} promotion notifications for Shiranui Flare Hoodie`,
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        promotionalPrice: 35.0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Register push token
 * POST /notifications/register-token
 */
router.post("/register-token", authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    if (!Expo.isExpoPushToken(token)) {
      return res.status(400).json({ error: "Invalid Expo push token" });
    }

    // Add token to user
    const user = await User.findById(req.userId);
    const existingToken = user.pushTokens.find((t) => t.token === token);

    if (!existingToken) {
      user.pushTokens.push({
        token,
        lastUsedAt: new Date(),
      });
      await user.save();
    }

    res.json({ message: "Token registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
