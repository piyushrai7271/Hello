import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload File to Cloudinary
const uploadOnCloudinary = async (file, folder = "Hellow") => {
  try {
    if (!file) return null;

    const base64File = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder,
      resource_type: "auto",
    });

    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

// Delete File from Cloudinary handles
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
};

// Multer Configuration

// Store file in memory (buffer)
const storage = multer.memoryStorage();

// Optional: File filter (recommended)
const fileFilter = (_, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 mb limit
  },
  fileFilter,
});

export { 
  cloudinary,
  upload,
  uploadOnCloudinary,
  deleteFromCloudinary
 };
