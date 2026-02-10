import express from "express";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Helper to convert Decimal128 to regular number
const convertProductPrice = (product) => {
  const converted = product.toObject ? product.toObject() : product;
  if (converted.price && converted.price.$numberDecimal) {
    converted.price = parseFloat(converted.price.$numberDecimal);
  } else if (converted.price) {
    converted.price = parseFloat(converted.price.toString());
  }
  return converted;
};

// GET all products with search & filter
router.get("/", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, vtuber } = req.query;

    let filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (vtuber) {
      filter.vtuberTag = { $regex: vtuber, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(filter)
      .populate("uploadedBy", "username profilePicture")
      .sort({ createdAt: -1 });

    const convertedProducts = products.map(convertProductPrice);

    console.log(`📦 GET /products - Filters:`, { search, category, minPrice, maxPrice });
    console.log(`📦 Found ${convertedProducts.length} products`);
    res.json(convertedProducts);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET categories
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET featured products (trending)
router.get("/featured/trending", async (req, res) => {
  try {
    const featured = await Product.find({ isActive: true })
      .sort({ reviewCount: -1, averageRating: -1 })
      .limit(10);
    const convertedFeatured = featured.map(convertProductPrice);
    res.json(convertedFeatured);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add image to product gallery
router.post("/:id/images", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.sendStatus(404);

    if (product.uploadedBy.toString() !== req.userId && !req.isAdmin) {
      return res.sendStatus(403);
    }

    if (req.file.path) {
      product.images.push(req.file.path);
      if (!product.image) product.image = req.file.path;
      await product.save();
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("uploadedBy", "username profilePicture")
      .populate({
        path: "reviews",
        populate: { path: "userId", select: "username profilePicture" },
      });
    if (!product) return res.status(404).json({ error: "Product not found" });
    const convertedProduct = convertProductPrice(product);
    res.json(convertedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE product (admin or user upload)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, description, vtuberTag } = req.body;

    const product = new Product({
      name,
      price,
      category,
      description,
      vtuberTag,
      uploadedBy: req.userId,
      image: req.file?.path || null,
      images: [req.file?.path].filter(Boolean),
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE product
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.sendStatus(404);

    // Check if user is admin or owner
    if (product.uploadedBy.toString() !== req.userId && !req.isAdmin) {
      return res.sendStatus(403);
    }

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE product
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.sendStatus(404);

    if (product.uploadedBy.toString() !== req.userId && !req.isAdmin) {
      return res.sendStatus(403);
    }

    await Product.deleteOne({ _id: req.params.id });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
