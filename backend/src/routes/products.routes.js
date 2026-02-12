import express from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";
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

    // Check if user is admin
    const user = await User.findById(req.userId);
    const isAdmin = user?.isAdmin || false;
    const isOwner = product.uploadedBy && product.uploadedBy.toString() === req.userId;
    const isSeededProduct = !product.uploadedBy;

    // Allow if user is admin OR owner, or if product is seeded
    if (!isAdmin && !isOwner && !isSeededProduct) {
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
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = await Product.findById(req.params.id)
      .populate("uploadedBy", "username profilePicture");
    if (!product) return res.status(404).json({ error: "Product not found" });
    const convertedProduct = convertProductPrice(product);
    console.log(`📦 GET /products/:${req.params.id} - Product found: ${product.name}`);
    res.json(convertedProduct);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(404).json({ error: "Product not found" });
  }
});

// CREATE product (admin or user upload)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, description, vtuberTag, image } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    // Get image from file upload or from body (URL string)
    let imageValue = null;
    if (req.file?.path) {
      // File was uploaded
      imageValue = req.file.path;
      console.log('📸 Product image from file upload:', imageValue);
    } else if (image && typeof image === 'string') {
      // Image URL was provided
      imageValue = image;
      console.log('🔗 Product image from URL:', imageValue);
    }

    const product = new Product({
      name,
      price: parseFloat(price),
      category,
      description,
      vtuberTag,
      uploadedBy: req.userId,
      image: imageValue,
      images: imageValue ? [imageValue] : [],
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE product
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.sendStatus(404);

    // Check if user is admin (query database to be sure)
    const user = await User.findById(req.userId);
    const isAdmin = user?.isAdmin || false;
    const isOwner = product.uploadedBy && product.uploadedBy.toString() === req.userId;
    
    // Allow if user is admin OR owner, or if product is seeded (no uploadedBy)
    const isSeededProduct = !product.uploadedBy;
    if (!isAdmin && !isOwner && !isSeededProduct) {
      return res.sendStatus(403);
    }

    // Update only specific fields from body
    const { name, price, category, description, vtuberTag, image } = req.body;
    
    if (name) product.name = name;
    if (price) product.price = price;
    if (category) product.category = category;
    if (description) product.description = description;
    if (vtuberTag) product.vtuberTag = vtuberTag;

    // Update image from file upload or URL string
    if (req.file?.path) {
      product.image = req.file.path;
      if (!product.images.includes(req.file.path)) {
        product.images.push(req.file.path);
      }
    } else if (image && typeof image === 'string') {
      // Only update if it's a different URL
      if (image !== product.image) {
        product.image = image;
      }
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE product
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.sendStatus(404);

    // Check if user is admin
    const user = await User.findById(req.userId);
    const isAdmin = user?.isAdmin || false;
    const isOwner = product.uploadedBy && product.uploadedBy.toString() === req.userId;
    const isSeededProduct = !product.uploadedBy;

    // Allow if user is admin OR owner, or if product is seeded
    if (!isAdmin && !isOwner && !isSeededProduct) {
      return res.sendStatus(403);
    }

    await Product.deleteOne({ _id: req.params.id });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
