// src/middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "holohaven/profile-pictures",
    allowed_formats: ["jpg", "png", "webp", "jpeg"],
    transformation: [{ width: 1024, crop: "limit" }],
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Upload fileFilter: Checking file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });
    
    // Accept image files only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

export default upload;
