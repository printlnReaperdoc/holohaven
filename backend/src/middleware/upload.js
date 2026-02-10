// src/middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "holohaven",
    allowed_formats: ["jpg", "png", "webp"],
    transformation: [{ width: 1024, crop: "limit" }],
  },
});

const upload = multer({ storage });
export default upload;
