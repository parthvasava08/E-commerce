import { cloudinary } from "../config/cloudinary.js";

export const discardUploads = async (req) => {
  const files = [
    ...(req.file ? [req.file] : []),
    ...Object.values(req.files || {}).flat(),
  ];
  await Promise.all(
    files.map((f) =>
      f?.filename
        ? cloudinary.uploader.destroy(f.filename).catch(() => {})
        : null,
    ),
  );
};

export const reject = async (req, res, status, message) => {
  await discardUploads(req);
  return res.status(status).json({ message });
};
