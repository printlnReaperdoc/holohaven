import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import cloudinary, { initCloudinary } from "./config/cloudinary.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import promotionsRoutes from "./routes/promotions.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";

dotenv.config({ override: true });

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/cart", cartRoutes);
app.use("/promotions", promotionsRoutes);
app.use("/notifications", notificationsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

const startServer = async () => {
  try {
    // MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Cloudinary (INIT AFTER ENV IS READY)
    initCloudinary();
    const status = await cloudinary.api.ping();
    console.log("✅ Cloudinary connected:", status.status);

    app.listen(process.env.PORT, () =>
      console.log(`🚀 API running on port ${process.env.PORT}`)
    );
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
