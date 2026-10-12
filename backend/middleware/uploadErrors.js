import { MAX_IMAGE_MB } from "./upload.js";

export default function handleUploadErrors(err, req, res, next) {
  const code = err?.code;

  if (code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message: `Image is too large. Maximum size is ${MAX_IMAGE_MB} MB per image.`,
    });
  }
  if (code === "INVALID_FILE_TYPE") {
    return res
      .status(400)
      .json({
        message:
          "Only JPG, PNG or WEBP images are allowed. Videos and other files are not supported.",
      });
  }
  if (code === "LIMIT_UNEXPECTED_FILE" || code === "LIMIT_FILE_COUNT") {
    return res
      .status(400)
      .json({ message: "Too many files, or a file in the wrong field." });
  }

  if (
    err?.http_code === 400 ||
    /invalid image file|format .* not allowed/i.test(err?.message || "")
  ) {
    return res
      .status(400)
      .json({ message: "That file is not a valid JPG, PNG or WEBP image." });
  }
  if (err?.http_code) {
    console.error("Cloudinary error:", err.message);
    return res
      .status(502)
      .json({ message: "Image upload failed. Please try again in a moment." });
  }
  next(err);
}
