import multer from "multer";
import { storage } from "../config/cloudinary.js";

export const MAX_IMAGE_MB = 5;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
  const err = new Error("Only JPG, PNG or WEBP images are allowed");
  err.code = "INVALID_FILE_TYPE";
  cb(err);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024, files: 5 },
});

export default upload;
